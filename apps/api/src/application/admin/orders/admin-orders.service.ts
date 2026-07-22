import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Not, type SelectQueryBuilder, Repository } from 'typeorm';

import { OrderCancelledReason } from '@/application/orders/order-cancelled-reason';
import { OrderStatus } from '@/application/orders/order-status';
import {
  availableOrderTransitions,
  isOrderTransitionAllowed,
} from '@/application/orders/order-status-transitions';
import { Order } from '@/application/orders/order.entity';
import { OrderNotFoundException } from '@/application/orders/orders.exceptions';
import { OrdersService } from '@/application/orders/orders.service';

import {
  OrderCreatedDateRangeInvalidException,
  OrderTransitionNotAllowedException,
} from './admin-orders.exceptions';

export type AdminOrderView = Order & {
  availableTransitions: OrderStatus[];
};

function utcDayStart(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00.000Z`);
}

function utcDayEnd(isoDate: string): Date {
  return new Date(`${isoDate}T23:59:59.999Z`);
}

@Injectable()
export class AdminOrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @Inject(OrdersService) private readonly ordersService: OrdersService,
  ) {}

  async list(query: {
    page: number;
    limit: number;
    status?: OrderStatus[];
    q?: string;
    createdFrom?: string;
    createdTo?: string;
  }): Promise<PaginatedResult<AdminOrderView>> {
    if (query.createdFrom != null && query.createdTo != null && query.createdFrom > query.createdTo) {
      throw new OrderCreatedDateRangeInvalidException(query.createdFrom, query.createdTo);
    }

    const statuses = (query.status ?? []).filter((status) => status !== OrderStatus.Draft);
    const createdFrom = query.createdFrom;
    const createdTo = query.createdTo;
    const searchTerm = query.q?.trim();

    const result = await PaginationHelper.paginate(
      this.ordersRepository,
      { page: query.page, limit: query.limit },
      {
        where: statuses.length > 0 ? { status: In(statuses) } : { status: Not(OrderStatus.Draft) },
        order: { createdAt: 'DESC' },
      },
      {
        alias: 'order',
        addToQueryBuilder: (qb: SelectQueryBuilder<Order>) => {
          if (createdFrom != null) {
            qb.andWhere('order.created_at >= :createdFrom', {
              createdFrom: utcDayStart(createdFrom),
            });
          }
          if (createdTo != null) {
            qb.andWhere('order.created_at <= :createdTo', {
              createdTo: utcDayEnd(createdTo),
            });
          }
          if (searchTerm) {
            const prefix = `${searchTerm}%`;
            qb.andWhere(
              new Brackets((where) => {
                where
                  .where('CAST(order.id AS text) ILIKE :idPrefix', { idPrefix: prefix })
                  .orWhere(
                    `TRIM(CONCAT(COALESCE(order.first_name, ''), ' ', COALESCE(order.last_name, ''))) ILIKE :namePrefix`,
                    { namePrefix: prefix },
                  )
                  .orWhere('order.phone ILIKE :phonePrefix', { phonePrefix: prefix });
              }),
            );
          }
        },
      },
    );

    return {
      items: result.items.map((order) => this.toAdminView(order)),
      meta: result.meta,
    };
  }

  async getById(orderId: string): Promise<AdminOrderView> {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order || order.status === OrderStatus.Draft) {
      throw new OrderNotFoundException(orderId);
    }
    return this.toAdminView(order);
  }

  async confirm(orderId: string): Promise<AdminOrderView> {
    return await this.applySimpleTransition(orderId, OrderStatus.Confirmed);
  }

  async send(orderId: string): Promise<AdminOrderView> {
    return await this.applySimpleTransition(orderId, OrderStatus.Sent);
  }

  async arrive(orderId: string): Promise<AdminOrderView> {
    return await this.applySimpleTransition(orderId, OrderStatus.Arrived);
  }

  async complete(orderId: string): Promise<AdminOrderView> {
    return await this.applySimpleTransition(orderId, OrderStatus.Completed);
  }

  async returnOrder(orderId: string): Promise<AdminOrderView> {
    return await this.applySimpleTransition(orderId, OrderStatus.Returned);
  }

  async archive(orderId: string): Promise<AdminOrderView> {
    return await this.applySimpleTransition(orderId, OrderStatus.Archived);
  }

  async cancel(orderId: string, cancelledReason: OrderCancelledReason): Promise<AdminOrderView> {
    const cancelled = await this.ordersService.cancelSubmittedOrder(orderId, cancelledReason);
    return this.toAdminView(cancelled);
  }

  private async applySimpleTransition(orderId: string, status: OrderStatus): Promise<AdminOrderView> {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order || order.status === OrderStatus.Draft) {
      throw new OrderNotFoundException(orderId);
    }

    if (!isOrderTransitionAllowed(order.status, status)) {
      throw new OrderTransitionNotAllowedException(order.status, status);
    }

    order.status = status;
    const saved = await this.ordersRepository.save(order);
    return this.toAdminView(saved);
  }

  private toAdminView(order: Order): AdminOrderView {
    const shippingCostMinor = order.delivery?.shippingCostMinor;
    order.grandTotalMinor =
      shippingCostMinor != null ? order.totalMinor + shippingCostMinor : order.totalMinor;

    return Object.assign(order, {
      availableTransitions: availableOrderTransitions(order.status),
    });
  }
}
