import { APP_LOGGER } from '@my-noodles/api-lib/logging';
import { TransactionalRepository } from '@my-noodles/api-lib/nest';
import { DEFAULT_CURRENCY } from '@my-noodles/utils';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { type DataSource, IsNull, LessThanOrEqual, type Repository } from 'typeorm';
import type { Logger } from 'winston';

import { TelegramService } from '@/application/telegram';

import type { CartItem } from '../cart/cart-item.entity';
import { CartEmptyException, CartInventoryChangedException } from '../cart/cart.exceptions';
import { CartService } from '../cart/cart.service';
import { DeliveryService } from '../delivery/delivery.service';
import { type InventoryLine, InventoryService } from '../inventory/inventory.service';
import { OrderDelivery } from '../orders/order-delivery.entity';
import { formatOrderDelivery } from '../orders/order-delivery.format';
import {
  createPartialDeliveryEntity,
  mapDeliveryDtoToEntity,
  mergeDeliveryDtoToEntity,
} from '../orders/order-delivery.mapper';
import { OrderItem } from '../orders/order-item.entity';
import { formatOrderReceiverName } from '../orders/order-receiver';
import { OrderStatus } from '../orders/order-status';
import { Order } from '../orders/order.entity';
import type { OrderResponseDto } from '../orders/orders.dto';
import { OrderInventoryChangedException } from '../orders/orders.exceptions';
import { CheckoutCancelledReason } from './checkout-cancelled-reason';
import { CheckoutStatus } from './checkout-status';
import { checkoutExpiresAt, checkoutHoldMinCreatedAt, isCheckoutExpired } from './checkout.config';
import { Checkout } from './checkout.entity';
import type {
  CheckoutDetailDto,
  CheckoutsListDto,
  CheckoutStartDto,
  CheckoutSummaryDto,
  SubmitCheckoutDto,
  UpdateCheckoutDeliveryDto,
  UpdateCheckoutReceiverDto,
} from './checkouts.dto';
import {
  CheckoutExpiredException,
  CheckoutNotFoundException,
  CheckoutNotInProgressException,
} from './checkouts.exceptions';

@Injectable()
export class CheckoutsService extends TransactionalRepository {
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
    @Inject(APP_LOGGER)
    private readonly logger: Logger,
  ) {
    super(dataSource);
  }

  async startFromCart(visitorSessionId: string): Promise<CheckoutStartDto> {
    const cartItems = await this.cartService.getCartItemsForOrder(visitorSessionId);
    if (cartItems.length === 0) {
      throw new CartEmptyException();
    }

    await this.validateCartInventory(visitorSessionId, cartItems);

    const existingCheckout = await this.findActiveInProgressCheckout(visitorSessionId);

    if (existingCheckout) {
      const checkout = await this.mergeCartIntoCheckout(existingCheckout, cartItems);
      await this.cartService.clearCartItems(visitorSessionId);
      return this.toCheckoutStart(checkout);
    }

    const checkout = await this.createCheckoutFromCart(visitorSessionId, cartItems);
    await this.cartService.clearCartItems(visitorSessionId);
    return this.toCheckoutStart(checkout);
  }

  async listCheckouts(visitorSessionId: string, status?: CheckoutStatus): Promise<CheckoutsListDto> {
    const checkouts = await this.checkoutsRepository.find({
      where: {
        visitorSessionId,
        deletedAt: IsNull(),
        ...(status ? { status } : {}),
      },
      relations: { order: { items: true } },
      order: { updatedAt: 'DESC' },
    });

    return {
      items: checkouts.map((checkout) => this.toCheckoutSummary(checkout)),
    };
  }

  async getCheckout(checkoutId: string, visitorSessionId: string): Promise<CheckoutDetailDto> {
    const checkout = await this.findVisitorCheckout(checkoutId, visitorSessionId);
    await this.ensureCheckoutActive(checkout);
    return await this.toCheckoutDetail(checkout);
  }

  async updateCheckoutReceiver(
    checkoutId: string,
    visitorSessionId: string,
    dto: UpdateCheckoutReceiverDto,
  ): Promise<CheckoutDetailDto> {
    const checkout = await this.findVisitorCheckout(checkoutId, visitorSessionId);
    await this.ensureCheckoutActive(checkout);

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
    return await this.toCheckoutDetail(await this.findVisitorCheckout(checkoutId, visitorSessionId));
  }

  async updateCheckoutDelivery(
    checkoutId: string,
    visitorSessionId: string,
    dto: UpdateCheckoutDeliveryDto,
  ): Promise<CheckoutDetailDto> {
    const checkout = await this.findVisitorCheckout(checkoutId, visitorSessionId);
    await this.ensureCheckoutActive(checkout);

    const order = checkout.order;

    if (order.delivery) {
      mergeDeliveryDtoToEntity(order.delivery, dto);
      await this.orderDeliveriesRepository.save(order.delivery);
    } else {
      await this.saveNewOrderDelivery(order, dto);
    }

    await this.ordersRepository.save(order);
    return await this.toCheckoutDetail(await this.findVisitorCheckout(checkoutId, visitorSessionId));
  }

  async submitCheckout(
    checkoutId: string,
    visitorSessionId: string,
    dto: SubmitCheckoutDto,
  ): Promise<OrderResponseDto> {
    const checkout = await this.findVisitorCheckout(checkoutId, visitorSessionId);

    if (checkout.status === CheckoutStatus.Completed) {
      return this.toOrderResponse(checkout.order);
    }

    await this.ensureCheckoutActive(checkout);

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
      await this.inventoryService.deductOnSubmit(inventoryLines);
      await this.ordersRepository.save(order);

      if (order.delivery) {
        Object.assign(order.delivery, delivery);
        await this.orderDeliveriesRepository.save(order.delivery);
      } else {
        await this.saveNewOrderDelivery(order, dto.delivery);
      }

      checkout.status = CheckoutStatus.Completed;
      checkout.completedAt = new Date();
      checkout.cancelledReason = null;
      await this.checkoutsRepository.save(checkout);
    });

    const submitted = await this.findVisitorCheckout(checkoutId, visitorSessionId);

    try {
      await this.telegramService.sendOrderNotification({
        orderId: submitted.order.id,
        createdAt: submitted.order.createdAt,
        customerName: formatOrderReceiverName(submitted.order),
        phone: submitted.order.phone!,
        deliverySummary: formatOrderDelivery(submitted.order.delivery!),
        currency: submitted.order.currency,
        totalMinor: submitted.order.totalMinor,
        lines: submitted.order.items.map((line) => ({
          title: line.titleSnapshot,
          qty: line.qty,
          lineTotalMinor: line.priceMinorSnapshot * line.qty,
        })),
      });
    } catch (error) {
      this.logger.error({
        msg: 'telegram.notify.failed',
        orderId: submitted.order.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }

    return this.toOrderResponse(submitted.order);
  }

  async cancelCheckout(checkoutId: string, visitorSessionId: string): Promise<CheckoutDetailDto> {
    const checkout = await this.findVisitorCheckout(checkoutId, visitorSessionId);

    if (checkout.status === CheckoutStatus.Cancelled) {
      return await this.toCheckoutDetail(checkout);
    }

    if (checkout.status !== CheckoutStatus.InProgress) {
      throw new CheckoutNotInProgressException(checkout.id, checkout.status);
    }

    await this.cancelCheckoutRecord(checkout, CheckoutCancelledReason.User);
    return await this.toCheckoutDetail(await this.findVisitorCheckout(checkoutId, visitorSessionId));
  }

  /** Called by CheckoutExpiryCron every 10s — do not invoke from request handlers. */
  async expireStaleCheckouts(): Promise<void> {
    const stale = await this.checkoutsRepository.find({
      where: {
        status: CheckoutStatus.InProgress,
        createdAt: LessThanOrEqual(checkoutHoldMinCreatedAt()),
        deletedAt: IsNull(),
      },
    });

    for (const checkout of stale) {
      await this.cancelCheckoutRecord(checkout, CheckoutCancelledReason.Expired);
    }
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

  private async findActiveInProgressCheckout(visitorSessionId: string): Promise<Checkout | null> {
    const checkout = await this.checkoutsRepository.findOne({
      where: {
        visitorSessionId,
        status: CheckoutStatus.InProgress,
        deletedAt: IsNull(),
      },
      relations: { order: { items: true } },
    });

    if (!checkout) {
      return null;
    }

    if (isCheckoutExpired(checkout)) {
      await this.cancelCheckoutRecord(checkout, CheckoutCancelledReason.Expired);
      return null;
    }

    return checkout;
  }

  private async createCheckoutFromCart(visitorSessionId: string, cartItems: CartItem[]): Promise<Checkout> {
    const totalMinor = cartItems.reduce((sum, item) => sum + item.product.priceMinor * item.qty, 0);
    const currency = cartItems[0]?.product.currency ?? DEFAULT_CURRENCY;

    return this.withTransaction(async () => {
      const savedOrder = await this.ordersRepository.save({
        visitorSessionId,
        firstName: null,
        lastName: null,
        phone: null,
        totalMinor,
        currency,
        status: OrderStatus.Draft,
        cancelledReason: null,
      });

      await this.orderItemsRepository.save(
        cartItems.map((item) => ({
          orderId: savedOrder.id,
          productId: item.productId,
          titleSnapshot: item.product.name.localized ?? '',
          priceMinorSnapshot: item.product.priceMinor,
          qty: item.qty,
        })),
      );

      const savedCheckout = await this.checkoutsRepository.save({
        orderId: savedOrder.id,
        visitorSessionId,
        status: CheckoutStatus.InProgress,
        cancelledReason: null,
        completedAt: null,
      });

      savedCheckout.order = savedOrder;
      return savedCheckout;
    });
  }

  private async mergeCartIntoCheckout(checkout: Checkout, cartItems: CartItem[]): Promise<Checkout> {
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

        const savedItem = await this.orderItemsRepository.save({
          orderId: order.id,
          productId: cartItem.productId,
          titleSnapshot: cartItem.product.name.localized ?? '',
          priceMinorSnapshot: cartItem.product.priceMinor,
          qty: cartItem.qty,
        });

        order.items.push(savedItem);
        itemsByProduct.set(cartItem.productId, savedItem);
      }

      order.totalMinor = order.items.reduce((sum, item) => sum + item.priceMinorSnapshot * item.qty, 0);
      order.currency = cartItems[0]?.product.currency ?? order.currency;
      await this.ordersRepository.save(order);
      await this.checkoutsRepository.save(checkout);
    });

    return checkout;
  }

  private async saveNewOrderDelivery(
    order: Order,
    dto: UpdateCheckoutDeliveryDto | SubmitCheckoutDto['delivery'],
  ): Promise<OrderDelivery> {
    const saved = await this.orderDeliveriesRepository.save(createPartialDeliveryEntity(order.id, dto));
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

      const totalMinor = lines.reduce(
        (sum, line) => sum + (priceByProduct.get(line.productId) ?? 0) * line.qty,
        0,
      );

      await this.ordersRepository.update({ id: order.id }, { totalMinor });
    });
  }

  private async cancelCheckoutRecord(checkout: Checkout, reason: CheckoutCancelledReason): Promise<void> {
    if (checkout.status !== CheckoutStatus.InProgress) {
      return;
    }

    const order =
      checkout.order?.items !== undefined
        ? checkout.order
        : await this.ordersRepository.findOne({
            where: { id: checkout.orderId },
            relations: { items: true },
          });

    if (order?.items.length) {
      await this.cartService.restoreItemsFromOrder(
        checkout.visitorSessionId,
        order.items.map((item) => ({ productId: item.productId, qty: item.qty })),
      );
    }

    checkout.status = CheckoutStatus.Cancelled;
    checkout.cancelledReason = reason;
    await this.checkoutsRepository.save(checkout);
  }

  private async ensureCheckoutActive(checkout: Checkout): Promise<void> {
    if (checkout.status !== CheckoutStatus.InProgress) {
      throw new CheckoutNotInProgressException(checkout.id, checkout.status);
    }

    if (isCheckoutExpired(checkout)) {
      await this.cancelCheckoutRecord(checkout, CheckoutCancelledReason.Expired);
      throw new CheckoutExpiredException(checkout.id);
    }
  }

  private async findVisitorCheckout(checkoutId: string, visitorSessionId: string): Promise<Checkout> {
    const checkout = await this.checkoutsRepository.findOne({
      where: { id: checkoutId, visitorSessionId, deletedAt: IsNull() },
      relations: { order: { items: true, delivery: true } },
    });

    if (!checkout) {
      throw new CheckoutNotFoundException(checkoutId);
    }

    return checkout;
  }

  private toCheckoutSummary(checkout: Checkout): CheckoutSummaryDto {
    const itemCount = checkout.order.items.reduce((sum, item) => sum + item.qty, 0);

    return {
      id: checkout.id,
      orderId: checkout.orderId,
      status: checkout.status,
      itemCount,
      totalMinor: checkout.order.totalMinor,
      currency: checkout.order.currency,
      updatedAt: checkout.updatedAt.toISOString(),
      expiresAt: checkout.status === CheckoutStatus.InProgress ? checkoutExpiresAt(checkout) : null,
    };
  }

  private toCheckoutStart(checkout: Checkout): CheckoutStartDto {
    return {
      id: checkout.id,
      orderId: checkout.orderId,
      status: checkout.status,
      totalMinor: checkout.order?.totalMinor ?? 0,
      currency: checkout.order?.currency ?? DEFAULT_CURRENCY,
      createdAt: checkout.createdAt.toISOString(),
    };
  }

  private toOrderResponse(order: Order): OrderResponseDto {
    return {
      id: order.id,
      status: order.status,
      totalMinor: order.totalMinor,
      currency: order.currency,
      createdAt: order.createdAt.toISOString(),
    };
  }

  private async toCheckoutDetail(checkout: Checkout): Promise<CheckoutDetailDto> {
    const order = checkout.order;

    return {
      id: checkout.id,
      orderId: order.id,
      status: checkout.status,
      totalMinor: order.totalMinor,
      currency: order.currency,
      firstName: order.firstName,
      lastName: order.lastName,
      phone: order.phone,
      items: order.items.map((item) => ({
        productId: item.productId,
        title: item.titleSnapshot,
        priceMinor: item.priceMinorSnapshot,
        qty: item.qty,
      })),
      delivery: order.delivery
        ? {
            provider: order.delivery.provider,
            method: order.delivery.method,
            city: order.delivery.city,
            cityRef: order.delivery.cityRef,
            warehouseNumber: order.delivery.warehouseNumber,
            warehouseName: order.delivery.warehouseName,
            warehouseRef: order.delivery.warehouseRef,
            street: order.delivery.street,
            building: order.delivery.building,
            apartment: order.delivery.apartment,
            notes: order.delivery.notes,
          }
        : null,
      deliveryEstimate: await this.deliveryService.estimateForOrder(order),
      createdAt: checkout.createdAt.toISOString(),
      expiresAt: checkout.status === CheckoutStatus.InProgress ? checkoutExpiresAt(checkout) : null,
    };
  }
}
