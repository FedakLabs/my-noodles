import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { type DataSource, In, type Repository } from 'typeorm';

import { TransactionalRepository } from '@/infrastructure/persistence';
import { TelegramService } from '@/infrastructure/services/Telegram';
import { DEFAULT_CURRENCY } from '@/utils/currency.config';

import { Product } from '../products/product.entity';
import { Order } from './order.entity';
import { OrderDelivery } from './order-delivery.entity';
import { formatOrderDelivery } from './order-delivery.format';
import { mapDeliveryDtoToEntity } from './order-delivery.mapper';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from './order-status';
import type { CreateOrderDto, OrderResponseDto } from './orders.dto';
import { OrderProductNotFoundException } from './orders.exceptions';

@Injectable()
export class OrdersService extends TransactionalRepository {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    @InjectDataSource()
    dataSource: DataSource,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderDelivery)
    private readonly orderDeliveriesRepository: Repository<OrderDelivery>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @Inject(TelegramService)
    private readonly telegramService: TelegramService,
  ) {
    super(dataSource);
  }

  async create(dto: CreateOrderDto): Promise<OrderResponseDto> {
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.productsRepository.find({
      where: { id: In(productIds) },
    });

    const productById = new Map(products.map((product) => [product.id, product]));

    const lineItems = dto.items.map((item) => {
      const product = productById.get(item.productId);
      if (!product) {
        throw new OrderProductNotFoundException(item.productId);
      }

      return {
        product,
        qty: item.qty,
        titleSnapshot: product.name.localized ?? '',
        priceMinorSnapshot: product.priceMinor,
      };
    });

    const totalMinor = lineItems.reduce((sum, line) => sum + line.priceMinorSnapshot * line.qty, 0);

    const { order, delivery } = await this.withTransaction(async () => {
      const savedOrder = await this.ordersRepository.save({
        customerName: dto.customerName,
        phone: dto.phone,
        totalMinor,
        currency: DEFAULT_CURRENCY,
        status: OrderStatus.New,
      });

      const savedDelivery = await this.orderDeliveriesRepository.save(
        mapDeliveryDtoToEntity(savedOrder.id, dto.delivery),
      );

      await this.orderItemsRepository.save(
        lineItems.map((line) => ({
          orderId: savedOrder.id,
          productId: line.product.id,
          titleSnapshot: line.titleSnapshot,
          priceMinorSnapshot: line.priceMinorSnapshot,
          qty: line.qty,
        })),
      );

      return { order: savedOrder, delivery: savedDelivery };
    });

    try {
      await this.telegramService.sendOrderNotification({
        orderId: order.id,
        createdAt: order.createdAt,
        customerName: order.customerName,
        phone: order.phone,
        deliverySummary: formatOrderDelivery(delivery),
        currency: order.currency,
        totalMinor: order.totalMinor,
        lines: lineItems.map((line) => ({
          title: line.titleSnapshot,
          qty: line.qty,
          lineTotalMinor: line.priceMinorSnapshot * line.qty,
        })),
      });
    } catch (error) {
      this.logger.error('telegram.notify.failed', {
        orderId: order.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return {
      id: order.id,
      status: order.status,
      totalMinor: order.totalMinor,
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
    };
  }
}
