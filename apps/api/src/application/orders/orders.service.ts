import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InventoryService } from '../inventory/inventory.service';
import { OrderCancelledReason } from './order-cancelled-reason';
import { OrderStatus } from './order-status';
import { Order } from './order.entity';
import type { OrderResponseDto } from './orders.dto';
import { OrderCancelNotAllowedException, OrderNotFoundException } from './orders.exceptions';

const MANAGER_CANCELLABLE_STATUSES = new Set<OrderStatus>([
  OrderStatus.New,
  OrderStatus.Confirmed,
  OrderStatus.Arrived,
]);

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @Inject(InventoryService)
    private readonly inventoryService: InventoryService,
  ) {}

  async cancelSubmittedOrder(orderId: string, reason: OrderCancelledReason): Promise<OrderResponseDto> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: { items: true },
    });

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    if (order.status === OrderStatus.Draft) {
      throw new OrderCancelNotAllowedException(order.status);
    }

    if (order.status === OrderStatus.Cancelled) {
      return this.toResponse(order);
    }

    if (!MANAGER_CANCELLABLE_STATUSES.has(order.status)) {
      throw new OrderCancelNotAllowedException(order.status);
    }

    await this.inventoryService.restoreOnCancel(
      order.items.map((item) => ({ productId: item.productId, qty: item.qty })),
    );

    order.status = OrderStatus.Cancelled;
    order.cancelledReason = reason;
    const saved = await this.ordersRepository.save(order);

    return this.toResponse(saved);
  }

  private toResponse(order: Order): OrderResponseDto {
    return {
      id: order.id,
      status: order.status,
      totalMinor: order.totalMinor,
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
