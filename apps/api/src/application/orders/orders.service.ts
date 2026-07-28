import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { InventoryService } from '../inventory/inventory.service';
import { OrderCancelledReason } from './order-cancelled-reason';
import { OrderStatus } from './order-status';
import { Order } from './order.entity';
import { OrderCancelNotAllowedException, OrderNotFoundException } from './orders.exceptions';

const MANAGER_CANCELLABLE_STATUSES = new Set<OrderStatus>([
  OrderStatus.New,
  OrderStatus.Confirmed,
  OrderStatus.Sent,
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

  async getForVisitor(orderId: string, visitorSessionId: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId, visitorSessionId },
    });

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    return order;
  }

  async cancelSubmittedOrder(orderId: string, reason: OrderCancelledReason): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new OrderNotFoundException(orderId);
    }

    if (order.status === OrderStatus.Draft) {
      throw new OrderCancelNotAllowedException(order.status);
    }

    if (order.status === OrderStatus.Cancelled) {
      return order;
    }

    if (!MANAGER_CANCELLABLE_STATUSES.has(order.status)) {
      throw new OrderCancelNotAllowedException(order.status);
    }

    await this.inventoryService.restoreOnCancel(
      order.items.map((item) => ({ productId: item.productId, qty: item.qty })),
    );

    order.status = OrderStatus.Cancelled;
    order.cancelledReason = reason;
    return await this.ordersRepository.save(order);
  }
}
