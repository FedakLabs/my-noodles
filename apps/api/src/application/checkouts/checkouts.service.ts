import { TransactionalRepository } from '@my-noodles/api-lib/nest';
import { catchIf } from '@my-noodles/api-lib/utils';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  type DataSource,
  type FindOptionsOrder,
  type FindOptionsWhere,
  LessThanOrEqual,
  type Repository,
} from 'typeorm';

import { TelegramService } from '@/application/telegram';

import type { CartItem } from '../cart/cart-item.entity';
import { CartEmptyException, CartInventoryChangedException } from '../cart/cart.exceptions';
import { CartService } from '../cart/cart.service';
import { DeliveryService } from '../delivery/delivery.service';
import { type InventoryLine, InventoryService } from '../inventory/inventory.service';
import { OrderDelivery } from '../orders/order-delivery.entity';
import {
  createPartialDeliveryEntity,
  mapDeliveryDtoToEntity,
  mergeDeliveryDtoToEntity,
} from '../orders/order-delivery.mapper';
import { OrderItem } from '../orders/order-item.entity';
import { OrderStatus } from '../orders/order-status';
import { Order } from '../orders/order.entity';
import { OrderInventoryChangedException } from '../orders/orders.exceptions';
import { CheckoutCalculator } from './checkout.calculator';
import { Checkout } from './checkout.entity';
import type {
  SubmitCheckoutDto,
  UpdateCheckoutDeliveryDto,
  UpdateCheckoutReceiverDto,
} from './checkouts.dto';
import { CheckoutInactiveException, CheckoutNotFoundException } from './checkouts.exceptions';
import { CheckoutCancelledReason, CheckoutStatus } from './checkouts.validators';

@Injectable()
export class CheckoutsService extends TransactionalRepository {
  private readonly calculator = new CheckoutCalculator();

  constructor(
    @InjectDataSource()
    dataSource: DataSource,
    @InjectRepository(Checkout)
    private readonly checkoutsRepository: Repository<Checkout>,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderDelivery)
    private readonly orderDeliveriesRepository: Repository<OrderDelivery>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    @Inject(CartService)
    private readonly cartService: CartService,
    @Inject(InventoryService)
    private readonly inventoryService: InventoryService,
    @Inject(TelegramService)
    private readonly telegramService: TelegramService,
    @Inject(DeliveryService)
    private readonly deliveryService: DeliveryService,
  ) {
    super(dataSource);
  }

  async listCheckouts(visitorSessionId: string, status?: CheckoutStatus): Promise<Checkout[]> {
    return await this.getAll({ visitorSessionId, status }, { updatedAt: 'DESC' });
  }

  async startFromCart(visitorSessionId: string): Promise<Checkout> {
    const cartItems = await this.cartService.getCartItems({ visitorSessionId });

    if (cartItems.length === 0) {
      throw new CartEmptyException();
    }

    await this.validateCartInventory(visitorSessionId, cartItems);

    const existingCheckout = await this.getActiveCheckout({
      visitorSessionId,
    }).catch(catchIf({ classes: [CheckoutNotFoundException, CheckoutInactiveException] }, null));

    if (existingCheckout) {
      const checkout = await this.mergeCartIntoCheckout(existingCheckout, cartItems);
      await this.cartService.clearCartItems(visitorSessionId);
      return checkout;
    }

    const checkout = await this.createCheckoutFromCart(visitorSessionId, cartItems);
    await this.cartService.clearCartItems(visitorSessionId);
    return checkout;
  }

  async updateCheckoutReceiver(
    checkoutId: string,
    visitorSessionId: string,
    dto: UpdateCheckoutReceiverDto,
  ): Promise<Checkout> {
    const checkout = await this.getActiveCheckout({ id: checkoutId, visitorSessionId });

    const order = checkout.order;

    if (dto.firstName !== undefined) {
      order.firstName = dto.firstName;
    }
    if (dto.lastName !== undefined) {
      order.lastName = dto.lastName;
    }
    if (dto.phone !== undefined) {
      order.phone = dto.phone;
    }

    await this.ordersRepository.save(order);

    return await this.getActiveCheckout({ id: checkoutId, visitorSessionId });
  }

  async updateCheckoutDelivery(
    checkoutId: string,
    visitorSessionId: string,
    dto: UpdateCheckoutDeliveryDto,
  ): Promise<Checkout> {
    const checkout = await this.getActiveCheckout({ id: checkoutId, visitorSessionId });

    const order = checkout.order;

    if (order.delivery) {
      mergeDeliveryDtoToEntity(order.delivery, dto);
      await this.orderDeliveriesRepository.save(order.delivery);
    } else {
      await this.saveNewOrderDelivery(order, dto);
    }

    await this.ordersRepository.save(order);

    return await this.getActiveCheckout({ id: checkoutId, visitorSessionId });
  }

  async submitCheckout(checkoutId: string, visitorSessionId: string, dto: SubmitCheckoutDto): Promise<Order> {
    const checkout = await this.getActiveCheckout({ id: checkoutId, visitorSessionId });

    const order = checkout.order;
    const inventoryLines: InventoryLine[] = order.items.map((item) => ({
      productId: item.productId,
      qty: item.qty,
    }));

    const grossQty = await this.inventoryService.getGrossQtyBatch(
      inventoryLines.map((line) => line.productId),
    );
    const { changed } = this.inventoryService.reconcileLines(inventoryLines, grossQty);

    if (changed) {
      await this.applyReconciledOrderItems(order, inventoryLines);
      throw new OrderInventoryChangedException();
    }

    order.firstName = dto.firstName;
    order.lastName = dto.lastName;
    order.phone = dto.phone;
    order.status = OrderStatus.New;

    const delivery = mapDeliveryDtoToEntity(order.id, dto.delivery);

    if (this.deliveryService.canEstimate(delivery)) {
      const estimate = await this.deliveryService.estimateFromDelivery(
        delivery,
        order.createdAt,
        order.items.length,
      );
      this.deliveryService.applyEstimateSnapshot(delivery, estimate);
    }

    await this.withTransaction(async () => {
      checkout.status = CheckoutStatus.Completed;
      checkout.completedAt = new Date();
      await this.checkoutsRepository.save(checkout);

      await this.inventoryService.deductOnSubmit(inventoryLines);
      await this.ordersRepository.save(order);

      if (order.delivery) {
        Object.assign(order.delivery, delivery);
        await this.orderDeliveriesRepository.save(order.delivery);
      } else {
        await this.saveNewOrderDelivery(order, dto.delivery);
      }

      void this.telegramService.sendOrderNotification(order);
    });

    return (await this.get({ id: checkoutId, visitorSessionId })).order;
  }

  async cancelCheckout(
    checkoutId: string,
    visitorSessionId: string,
    reason: CheckoutCancelledReason,
  ): Promise<Checkout> {
    const checkout = await this.get({
      id: checkoutId,
      visitorSessionId,
    });

    if (checkout.status !== CheckoutStatus.Active) {
      throw new CheckoutInactiveException(checkout.id, checkout.status);
    }

    checkout.status = CheckoutStatus.Cancelled;
    checkout.cancelledReason = reason;
    await this.checkoutsRepository.save(checkout);

    if (checkout.order.items.length) {
      await this.cartService.restoreItemsFromOrder(
        checkout.visitorSessionId,
        checkout.order.items.map((item) => ({ productId: item.productId, qty: item.qty })),
      );
    }

    return await this.get({ id: checkoutId, visitorSessionId });
  }

  async getActiveCheckout(where: FindOptionsWhere<Checkout>): Promise<Checkout> {
    const checkout = await this.get(where);

    if (checkout.status !== CheckoutStatus.Active) {
      throw new CheckoutInactiveException(checkout.id, checkout.status);
    }

    if (checkout.isHoldElapsed) {
      const cancelled = await this.cancelCheckout(
        checkout.id,
        checkout.visitorSessionId,
        CheckoutCancelledReason.Expired,
      );
      throw new CheckoutInactiveException(cancelled.id, cancelled.status);
    }

    return checkout;
  }

  async getAll(where: FindOptionsWhere<Checkout>, order?: FindOptionsOrder<Checkout>): Promise<Checkout[]> {
    const checkouts = await this.checkoutsRepository.find({ where, order });
    return await Promise.all(checkouts.map((checkout) => this.attachCheckoutAggregates(checkout)));
  }

  async get(where: FindOptionsWhere<Checkout>): Promise<Checkout> {
    const checkout = await this.checkoutsRepository.findOne({ where });

    if (!checkout) {
      throw new CheckoutNotFoundException(typeof where.id === 'string' ? where.id : undefined);
    }

    return await this.attachCheckoutAggregates(checkout);
  }

  async expireStaleCheckouts(): Promise<void> {
    const stale = await this.checkoutsRepository.find({
      where: {
        status: CheckoutStatus.Active,
        expiresAt: LessThanOrEqual(new Date()),
      },
    });

    await Promise.all(
      stale.map((checkout) =>
        this.cancelCheckout(checkout.id, checkout.visitorSessionId, CheckoutCancelledReason.Expired),
      ),
    );
  }

  private async validateCartInventory(visitorSessionId: string, cartItems: CartItem[]): Promise<void> {
    const inventoryLines = cartItems.map((item) => ({ productId: item.productId, qty: item.qty }));
    const available = await this.inventoryService.getAvailableQtyBatch(
      inventoryLines.map((line) => line.productId),
    );
    const { changed } = this.inventoryService.reconcileLines(inventoryLines, available);

    if (changed) {
      await this.cartService.applyReconciledQuantities(visitorSessionId, inventoryLines);

      if (!inventoryLines.some((line) => line.qty > 0)) {
        throw new CartEmptyException();
      }

      throw new CartInventoryChangedException();
    }
  }

  private async createCheckoutFromCart(visitorSessionId: string, cartItems: CartItem[]): Promise<Checkout> {
    const firstCartItem = cartItems.at(0);
    if (!firstCartItem) {
      throw new CartEmptyException();
    }

    const totalMinor = this.calculator.sumLines(
      cartItems.map((item) => ({ unitMinor: item.product.priceMinor, qty: item.qty })),
    );
    const currency = firstCartItem.product.currency;

    return await this.withTransaction(async () => {
      const savedOrder = await this.ordersRepository.save(
        this.ordersRepository.create({
          visitorSessionId,
          totalMinor,
          currency,
          cancelledReason: null,
        }),
      );

      await this.orderItemsRepository.save(
        this.orderItemsRepository.create(
          cartItems.map((item) => ({
            orderId: savedOrder.id,
            productId: item.productId,
            titleSnapshot: item.product.name.localized ?? '',
            priceMinorSnapshot: item.product.priceMinor,
            qty: item.qty,
          })),
        ),
      );

      const savedCheckout = await this.checkoutsRepository.save(
        this.checkoutsRepository.create({
          orderId: savedOrder.id,
          visitorSessionId,
        }),
      );

      return await this.get({ id: savedCheckout.id, visitorSessionId });
    });
  }

  private async mergeCartIntoCheckout(checkout: Checkout, cartItems: CartItem[]): Promise<Checkout> {
    const firstCartItem = cartItems[0];
    if (!firstCartItem) {
      throw new CartEmptyException();
    }

    const order = checkout.order;
    const itemsByProduct = new Map(order.items.map((item) => [item.productId, item]));

    await this.withTransaction(async () => {
      for (const cartItem of cartItems) {
        const existing = itemsByProduct.get(cartItem.productId);

        if (existing) {
          existing.qty += cartItem.qty;
          existing.titleSnapshot = cartItem.product.name.localized ?? '';
          existing.priceMinorSnapshot = cartItem.product.priceMinor;
          await this.orderItemsRepository.save(existing);
          continue;
        }

        await this.orderItemsRepository.save(
          this.orderItemsRepository.create({
            orderId: order.id,
            productId: cartItem.productId,
            titleSnapshot: cartItem.product.name.localized ?? '',
            priceMinorSnapshot: cartItem.product.priceMinor,
            qty: cartItem.qty,
          }),
        );
      }

      const items = await this.orderItemsRepository.find({ where: { orderId: order.id } });
      order.totalMinor = this.calculator.sumLines(
        items.map((item) => ({ unitMinor: item.priceMinorSnapshot, qty: item.qty })),
      );
      order.currency = firstCartItem.product.currency;
      await this.ordersRepository.save(order);
      await this.checkoutsRepository.save(checkout);
    });

    return await this.get({ id: checkout.id, visitorSessionId: checkout.visitorSessionId });
  }

  private async saveNewOrderDelivery(
    order: Order,
    dto: UpdateCheckoutDeliveryDto | SubmitCheckoutDto['delivery'],
  ): Promise<OrderDelivery> {
    const saved = await this.orderDeliveriesRepository.save(
      this.orderDeliveriesRepository.create(createPartialDeliveryEntity(order.id, dto)),
    );
    order.delivery = saved;
    return saved;
  }

  private async applyReconciledOrderItems(order: Order, lines: InventoryLine[]): Promise<void> {
    const qtyByProduct = new Map(lines.map((line) => [line.productId, line.qty]));
    const priceByProduct = new Map(order.items.map((item) => [item.productId, item.priceMinorSnapshot]));

    await this.withTransaction(async () => {
      for (const item of order.items) {
        const nextQty = qtyByProduct.get(item.productId) ?? 0;

        if (nextQty <= 0) {
          await this.orderItemsRepository.delete({ id: item.id });
          continue;
        }

        if (nextQty !== item.qty) {
          await this.orderItemsRepository.update({ id: item.id }, { qty: nextQty });
        }
      }

      const totalMinor = this.calculator.sumLines(
        lines.map((line) => ({
          unitMinor: priceByProduct.get(line.productId) ?? 0,
          qty: line.qty,
        })),
      );

      await this.ordersRepository.update({ id: order.id }, { totalMinor });
    });
  }

  private async attachCheckoutAggregates(checkout: Checkout): Promise<Checkout> {
    if (checkout.status !== CheckoutStatus.Active) {
      return checkout;
    }

    checkout.deliveryEstimate = await this.deliveryService.estimateForOrder(checkout.order);
    return this.calculator.calculateTotals(checkout);
  }
}
