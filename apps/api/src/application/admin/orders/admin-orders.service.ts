import { type PaginatedResult, PaginationHelper } from '@my-noodles/api-lib/pagination';
import { utcDayEnd, utcDayStart } from '@my-noodles/utils';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Between,
  type FindOptionsOrder,
  type FindOptionsWhere,
  ILike,
  In,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Raw,
  type Repository,
} from 'typeorm';

import { OrderCancelledReason } from '@/application/orders/order-cancelled-reason';
import { OrderStatus } from '@/application/orders/order-status';
import { isOrderTransitionAllowed } from '@/application/orders/order-status-transitions';
import { Order } from '@/application/orders/order.entity';
import { OrderNotFoundException } from '@/application/orders/orders.exceptions';
import { OrdersService } from '@/application/orders/orders.service';

import { AdminOrder } from './admin-order.entity';
import { AdminOrdersSortBy, AdminOrdersSortOrder } from './admin-orders.dto';
import {
  OrderCreatedDateRangeInvalidException,
  OrderTransitionNotAllowedException,
} from './admin-orders.exceptions';

const SORT_PROPERTIES: Record<AdminOrdersSortBy, keyof Order> = {
  [AdminOrdersSortBy.CreatedAt]: 'createdAt',
  [AdminOrdersSortBy.Status]: 'status',
  [AdminOrdersSortBy.TotalMinor]: 'totalMinor',
  [AdminOrdersSortBy.Id]: 'id',
  [AdminOrdersSortBy.Phone]: 'phone',
};

function createdAtRangeWhere(createdFrom?: string, createdTo?: string): FindOptionsWhere<Order> | undefined {
  if (createdFrom != null && createdTo != null) {
    return { createdAt: Between(utcDayStart(createdFrom), utcDayEnd(createdTo)) };
  }
  if (createdFrom != null) {
    return { createdAt: MoreThanOrEqual(utcDayStart(createdFrom)) };
  }
  if (createdTo != null) {
    return { createdAt: LessThanOrEqual(utcDayEnd(createdTo)) };
  }
  return undefined;
}

function mergeWhere(
  where: FindOptionsWhere<Order> | FindOptionsWhere<Order>[],
  extra: FindOptionsWhere<Order> | undefined,
): FindOptionsWhere<Order> | FindOptionsWhere<Order>[] {
  if (extra == null) {
    return where;
  }
  if (Array.isArray(where)) {
    return where.map((clause) => ({ ...clause, ...extra }));
  }
  return { ...where, ...extra };
}

@Injectable()
export class AdminOrdersService {
  constructor(
    @InjectRepository(AdminOrder)
    private readonly ordersRepository: Repository<AdminOrder>,
    @Inject(OrdersService) private readonly ordersService: OrdersService,
  ) {}

  async list(query: {
    page: number;
    limit: number;
    status?: OrderStatus[];
    q?: string;
    createdFrom?: string;
    createdTo?: string;
    sortBy?: AdminOrdersSortBy;
    sortOrder?: AdminOrdersSortOrder;
  }): Promise<PaginatedResult<AdminOrder>> {
    if (query.createdFrom != null && query.createdTo != null && query.createdFrom > query.createdTo) {
      throw new OrderCreatedDateRangeInvalidException(query.createdFrom, query.createdTo);
    }

    const statuses = (query.status ?? []).filter((status) => status !== OrderStatus.Draft);
    const searchTerm = query.q?.trim();
    const sortBy = query.sortBy ?? AdminOrdersSortBy.CreatedAt;
    const sortOrder =
      query.sortOrder ?? (query.sortBy == null ? AdminOrdersSortOrder.Desc : AdminOrdersSortOrder.Asc);
    const statusWhere = statuses.length > 0 ? In(statuses) : Not(OrderStatus.Draft);

    let where: FindOptionsWhere<Order> | FindOptionsWhere<Order>[] = { status: statusWhere };
    if (searchTerm) {
      const prefix = `${searchTerm}%`;
      where = [
        {
          status: statusWhere,
          id: Raw((alias) => `CAST(${alias} AS text) ILIKE :idPrefix`, { idPrefix: prefix }),
        },
        { status: statusWhere, firstName: ILike(prefix) },
        { status: statusWhere, lastName: ILike(prefix) },
        { status: statusWhere, phone: ILike(prefix) },
      ];
    }
    where = mergeWhere(where, createdAtRangeWhere(query.createdFrom, query.createdTo));

    const order: FindOptionsOrder<Order> = {
      [SORT_PROPERTIES[sortBy]]: sortOrder === AdminOrdersSortOrder.Asc ? 'ASC' : 'DESC',
    };

    const result = await PaginationHelper.paginate(
      this.ordersRepository,
      { page: query.page, limit: query.limit },
      {
        where,
        order,
      },
    );

    return {
      items: result.items.map((order) => this.asAdminOrder(order)),
      meta: result.meta,
    };
  }

  async getById(orderId: string): Promise<AdminOrder> {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order || order.status === OrderStatus.Draft) {
      throw new OrderNotFoundException(orderId);
    }
    return this.asAdminOrder(order);
  }

  async confirm(orderId: string): Promise<AdminOrder> {
    return await this.applySimpleTransition(orderId, OrderStatus.Confirmed);
  }

  async send(orderId: string): Promise<AdminOrder> {
    return await this.applySimpleTransition(orderId, OrderStatus.Sent);
  }

  async arrive(orderId: string): Promise<AdminOrder> {
    return await this.applySimpleTransition(orderId, OrderStatus.Arrived);
  }

  async complete(orderId: string): Promise<AdminOrder> {
    return await this.applySimpleTransition(orderId, OrderStatus.Completed);
  }

  async returnOrder(orderId: string): Promise<AdminOrder> {
    return await this.applySimpleTransition(orderId, OrderStatus.Returned);
  }

  async archive(orderId: string): Promise<AdminOrder> {
    return await this.applySimpleTransition(orderId, OrderStatus.Archived);
  }

  async cancel(orderId: string, cancelledReason: OrderCancelledReason): Promise<AdminOrder> {
    const cancelled = await this.ordersService.cancelSubmittedOrder(orderId, cancelledReason);
    return this.asAdminOrder(cancelled);
  }

  private async applySimpleTransition(orderId: string, status: OrderStatus): Promise<AdminOrder> {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order || order.status === OrderStatus.Draft) {
      throw new OrderNotFoundException(orderId);
    }

    if (!isOrderTransitionAllowed(order.status, status)) {
      throw new OrderTransitionNotAllowedException(order.status, status);
    }

    order.status = status;
    const saved = await this.ordersRepository.save(order);
    return this.asAdminOrder(saved);
  }

  /** Rehydrate as {@link AdminOrder} so subclass getters work (repo aliases {@link Order}). */
  private asAdminOrder(order: Order): AdminOrder {
    return Object.assign(new AdminOrder(), order);
  }
}
