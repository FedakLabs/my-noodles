import { CartEmptyException } from '@/application/cart/cart.exceptions';
import { CheckoutsService, CheckoutStatus } from '@/application/checkouts';
import { Checkout } from '@/application/checkouts/checkout.entity';
import {
  CheckoutInactiveException,
  CheckoutNotFoundException,
} from '@/application/checkouts/checkouts.exceptions';
import { CheckoutCancelledReason } from '@/application/checkouts/checkouts.validators';
import { type InventoryService } from '@/application/inventory/inventory.service';
import {
  DeliveryMethod,
  DeliveryProvider,
  Order,
  OrderDelivery,
  OrderItem,
  OrderStatus,
} from '@/application/orders';
import { OrderInventoryChangedException } from '@/application/orders/orders.exceptions';

import { jest } from '../jest-globals';

function asCheckout(partial: object): Checkout {
  return Object.assign(new Checkout(), partial);
}

describe('CheckoutsService', () => {
  let transaction: jest.Mock;
  let checkoutsFindOne: jest.Mock;
  let checkoutsFind: jest.Mock;
  let checkoutSave: jest.Mock;
  let checkoutUpdate: jest.Mock;
  let orderSave: jest.Mock;
  let orderUpdate: jest.Mock;
  let deliverySave: jest.Mock;
  let itemSave: jest.Mock;
  let itemFind: jest.Mock;
  let itemUpdate: jest.Mock;
  let itemDelete: jest.Mock;
  let telegramSend: jest.Mock;
  let getCartItems: jest.Mock;
  let clearCartItems: jest.Mock;
  let restoreItemsFromOrder: jest.Mock;
  let applyReconciledQuantities: jest.Mock;
  let getAvailableQtyBatch: jest.Mock;
  let getGrossQtyBatch: jest.Mock;
  let reconcileLines: jest.Mock;
  let deductOnSubmit: jest.Mock;
  let estimateForOrder: jest.Mock;
  let canEstimate: jest.Mock;
  let estimateFromDelivery: jest.Mock;
  let applyEstimateSnapshot: jest.Mock;
  let service: CheckoutsService;

  const futureExpiresAt = () => new Date(Date.now() + 15 * 60_000);
  const pastExpiresAt = () => new Date(Date.now() - 60_000);

  const delivery = {
    provider: DeliveryProvider.NovaPoshta,
    method: DeliveryMethod.Warehouse,
    city: 'Київ',
    cityRef: 'city-kyiv-ref',
    warehouseNumber: '1',
    warehouseName: 'Відділення №1',
    warehouseRef: 'warehouse-ref-1',
  };

  beforeEach(() => {
    checkoutSave = jest.fn().mockImplementation((entity: Checkout) => {
      if (entity.id) {
        return Promise.resolve(entity);
      }

      entity.setDefaultExpiresAt();
      const saved = asCheckout({
        ...entity,
        id: 'checkout-1',
        orderId: 'order-1',
        createdAt: new Date('2025-06-20T10:00:00.000Z'),
        order: {
          id: 'order-1',
          totalMinor: 19_800,
          currency: 'UAH',
          status: OrderStatus.Draft,
          items: [{ productId: 'product-1', qty: 2 }],
          delivery: null,
        },
      });
      checkoutsFindOne.mockResolvedValue(saved);
      return Promise.resolve(saved);
    });
    const checkoutCreate = jest
      .fn()
      .mockImplementation((entity: object) => Object.assign(Object.create(Checkout.prototype), entity));
    checkoutUpdate = jest.fn().mockResolvedValue({ affected: 1 });

    orderSave = jest.fn().mockImplementation((entity: object) =>
      Promise.resolve({
        id: 'order-1',
        createdAt: new Date('2025-06-20T10:00:00.000Z'),
        firstName: null,
        lastName: null,
        phone: null,
        totalMinor: 19_800,
        currency: 'UAH',
        status: OrderStatus.Draft,
        ...entity,
      }),
    );
    const orderCreate = jest
      .fn()
      .mockImplementation((entity: object) => Object.assign(Object.create(Order.prototype), entity));

    deliverySave = jest.fn().mockResolvedValue({});
    const deliveryCreate = jest
      .fn()
      .mockImplementation((entity: object) => Object.assign(Object.create(OrderDelivery.prototype), entity));
    itemSave = jest.fn().mockImplementation((entity: object) => Promise.resolve(entity));
    itemFind = jest.fn().mockResolvedValue([]);
    const itemCreate = jest.fn().mockImplementation((entities: object | object[]) => {
      const create = (entity: object) => Object.assign(Object.create(OrderItem.prototype), entity);
      return Array.isArray(entities) ? entities.map(create) : create(entities);
    });
    itemUpdate = jest.fn().mockResolvedValue(undefined);
    itemDelete = jest.fn().mockResolvedValue(undefined);
    orderUpdate = jest.fn().mockResolvedValue(undefined);
    checkoutsFindOne = jest.fn().mockResolvedValue(null);
    checkoutsFind = jest.fn().mockResolvedValue([]);
    transaction = jest.fn(async (callback: () => Promise<unknown>) => await callback());
    getCartItems = jest.fn().mockResolvedValue([
      {
        productId: 'product-1',
        qty: 2,
        product: {
          id: 'product-1',
          name: { localized: 'Pocky' },
          priceMinor: 9_900,
          currency: 'UAH',
        },
      },
    ]);
    clearCartItems = jest.fn().mockResolvedValue(undefined);
    restoreItemsFromOrder = jest.fn().mockResolvedValue(undefined);
    applyReconciledQuantities = jest.fn().mockResolvedValue(undefined);
    telegramSend = jest.fn().mockResolvedValue(undefined);
    getAvailableQtyBatch = jest.fn().mockResolvedValue(new Map([['product-1', 2]]));
    getGrossQtyBatch = jest.fn().mockResolvedValue(new Map([['product-1', 2]]));
    reconcileLines = jest.fn().mockReturnValue({ changed: false });
    deductOnSubmit = jest.fn().mockResolvedValue(undefined);
    estimateForOrder = jest.fn().mockResolvedValue(null);
    canEstimate = jest.fn().mockReturnValue(true);
    estimateFromDelivery = jest.fn().mockResolvedValue({
      estimatedDeliveryAt: '2025-06-23T10:00:00.000Z',
      estimatedDaysMin: 2,
      estimatedDaysMax: 3,
      shippingCostMinor: 6_500,
    });
    applyEstimateSnapshot = jest.fn();

    service = new CheckoutsService(
      { transaction } as never,
      {
        findOne: checkoutsFindOne,
        find: checkoutsFind,
        save: checkoutSave,
        create: checkoutCreate,
        update: checkoutUpdate,
      } as never,
      { create: orderCreate, save: orderSave, update: orderUpdate } as never,
      { create: deliveryCreate, save: deliverySave } as never,
      { create: itemCreate, save: itemSave, find: itemFind, update: itemUpdate, delete: itemDelete } as never,
      { getCartItems, clearCartItems, restoreItemsFromOrder, applyReconciledQuantities } as never,
      {
        getAvailableQtyBatch,
        getGrossQtyBatch,
        reconcileLines,
        deductOnSubmit,
      } as unknown as InventoryService,
      { sendOrderNotification: telegramSend } as never,
      { estimateForOrder, canEstimate, estimateFromDelivery, applyEstimateSnapshot } as never,
    );
  });

  it('starts checkout from cart items', async () => {
    const result = await service.startFromCart('visitor-1');

    expect(result.id).toBe('checkout-1');
    expect(result.orderId).toBe('order-1');
    expect(result.order.totalMinor).toBe(19_800);
    expect(result.order.grandTotalMinor).toBe(19_800);
    expect(reconcileLines).toHaveBeenCalled();
    expect(clearCartItems).toHaveBeenCalledWith('visitor-1');
    expect(itemSave).toHaveBeenCalled();
    expect(checkoutSave).toHaveBeenCalledWith(
      expect.objectContaining({
        status: CheckoutStatus.InProgress,
        orderId: 'order-1',
        visitorSessionId: 'visitor-1',
      }),
    );
  });

  it('merges cart items into an active in-progress checkout', async () => {
    const existingCheckout = asCheckout({
      id: 'checkout-existing',
      orderId: 'order-existing',
      visitorSessionId: 'visitor-1',
      status: CheckoutStatus.InProgress,
      cancelledReason: null,
      createdAt: new Date(),
      expiresAt: futureExpiresAt(),
      order: {
        id: 'order-existing',
        totalMinor: 9_900,
        currency: 'UAH',
        items: [
          {
            id: 'line-1',
            productId: 'product-1',
            titleSnapshot: 'Pocky',
            priceMinorSnapshot: 9_900,
            qty: 1,
          },
        ],
      },
    });

    checkoutsFindOne.mockResolvedValue(existingCheckout);
    itemFind.mockResolvedValue([
      {
        id: 'line-1',
        productId: 'product-1',
        titleSnapshot: 'Pocky',
        priceMinorSnapshot: 9_900,
        qty: 3,
      },
    ]);

    const result = await service.startFromCart('visitor-1');

    expect(result.id).toBe('checkout-existing');
    expect(result.orderId).toBe('order-existing');
    expect(result.order.totalMinor).toBe(29_700);
    expect(result.order.grandTotalMinor).toBe(29_700);
    expect(itemSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'line-1', qty: 3, priceMinorSnapshot: 9_900 }),
    );
    expect(orderSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'order-existing', totalMinor: 29_700 }),
    );
    expect(checkoutSave).toHaveBeenCalledWith(existingCheckout);
    expect(clearCartItems).toHaveBeenCalledWith('visitor-1');
  });

  it('creates a new checkout when there is no in-progress checkout', async () => {
    checkoutsFindOne.mockResolvedValueOnce(null);

    const result = await service.startFromCart('visitor-1');

    expect(result.id).toBe('checkout-1');
    expect(result.orderId).toBe('order-1');
    expect(restoreItemsFromOrder).not.toHaveBeenCalled();
  });

  it('rejects checkout start when cart is empty', async () => {
    getCartItems.mockResolvedValueOnce([]);

    await expect(service.startFromCart('visitor-1')).rejects.toBeInstanceOf(CartEmptyException);
  });

  it('lists in-progress checkouts for visitor', async () => {
    const expiresAt = new Date('2025-06-20T10:15:00.000Z');
    checkoutsFind.mockResolvedValue([
      asCheckout({
        id: 'checkout-1',
        orderId: 'order-1',
        status: CheckoutStatus.InProgress,
        updatedAt: new Date('2025-06-20T10:05:00.000Z'),
        createdAt: new Date('2025-06-20T10:00:00.000Z'),
        expiresAt,
        order: {
          items: [{ qty: 2 }, { qty: 1 }],
          totalMinor: 19_800,
          currency: 'UAH',
        },
      }),
    ]);

    const result = await service.listCheckouts('visitor-1', CheckoutStatus.InProgress);

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'checkout-1',
      status: CheckoutStatus.InProgress,
      expiresAt,
      order: {
        items: [{ qty: 2 }, { qty: 1 }],
        totalMinor: 19_800,
      },
    });
    expect(checkoutsFind).toHaveBeenCalled();
  });

  it('returns checkout detail when checkout is cancelled', async () => {
    const cancelled = asCheckout({
      id: 'checkout-1',
      orderId: 'order-1',
      visitorSessionId: 'visitor-1',
      status: CheckoutStatus.Cancelled,
      cancelledReason: 'user',
      createdAt: new Date(),
      expiresAt: pastExpiresAt(),
      order: {
        id: 'order-1',
        status: OrderStatus.Draft,
        items: [],
        delivery: null,
        totalMinor: 1000,
        currency: 'UAH',
        firstName: null,
        lastName: null,
        phone: null,
        createdAt: new Date(),
      },
    });
    checkoutsFindOne.mockResolvedValue(cancelled);

    const result = await service.get({ id: 'checkout-1', visitorSessionId: 'visitor-1' });

    expect(result.status).toBe(CheckoutStatus.Cancelled);
    expect(result.cancelledReason).toBe('user');
  });

  it('returns checkout detail when hold has elapsed but status is still in progress', async () => {
    const elapsed = asCheckout({
      id: 'checkout-1',
      orderId: 'order-1',
      visitorSessionId: 'visitor-1',
      status: CheckoutStatus.InProgress,
      cancelledReason: null,
      createdAt: new Date(),
      expiresAt: pastExpiresAt(),
      order: {
        id: 'order-1',
        status: OrderStatus.Draft,
        items: [{ productId: 'product-1', qty: 2 }],
        delivery: null,
        totalMinor: 1000,
        currency: 'UAH',
        firstName: null,
        lastName: null,
        phone: null,
        createdAt: new Date(),
      },
    });
    checkoutsFindOne.mockResolvedValue(elapsed);

    const result = await service.get({ id: 'checkout-1', visitorSessionId: 'visitor-1' });

    expect(result.status).toBe(CheckoutStatus.InProgress);
    expect(result.isHoldElapsed).toBe(true);
    expect(checkoutSave).not.toHaveBeenCalled();
  });

  it('attaches delivery estimate and grand total on checkout detail', async () => {
    checkoutsFindOne.mockResolvedValue(
      asCheckout({
        id: 'checkout-1',
        orderId: 'order-1',
        visitorSessionId: 'visitor-1',
        status: CheckoutStatus.InProgress,
        cancelledReason: null,
        createdAt: new Date(),
        expiresAt: futureExpiresAt(),
        order: {
          id: 'order-1',
          status: OrderStatus.Draft,
          items: [],
          delivery: null,
          totalMinor: 9_900,
          currency: 'UAH',
          firstName: null,
          lastName: null,
          phone: null,
          createdAt: new Date(),
        },
      }),
    );
    estimateForOrder.mockResolvedValue({
      estimatedDeliveryAt: '2025-06-23T10:00:00.000Z',
      estimatedDaysMin: 2,
      estimatedDaysMax: 3,
      shippingCostMinor: 650,
    });

    const result = await service.get({ id: 'checkout-1', visitorSessionId: 'visitor-1' });

    expect(result.deliveryEstimate?.shippingCostMinor).toBe(650);
    expect(result.order.grandTotalMinor).toBe(10_550);
  });

  it('cancels checkout and restores order items to cart', async () => {
    const checkout = asCheckout({
      id: 'checkout-1',
      orderId: 'order-1',
      visitorSessionId: 'visitor-1',
      status: CheckoutStatus.InProgress,
      cancelledReason: null,
      createdAt: new Date(),
      expiresAt: futureExpiresAt(),
      order: {
        id: 'order-1',
        status: OrderStatus.Draft,
        items: [{ productId: 'product-1', qty: 2 }],
        delivery: null,
        totalMinor: 1000,
        currency: 'UAH',
        firstName: null,
        lastName: null,
        phone: null,
        createdAt: new Date(),
      },
    });

    const cancelled = asCheckout({
      ...checkout,
      status: CheckoutStatus.Cancelled,
      cancelledReason: 'user',
    });
    checkoutsFindOne.mockResolvedValueOnce(checkout).mockResolvedValueOnce(cancelled);

    const result = await service.cancelCheckout('checkout-1', 'visitor-1', CheckoutCancelledReason.User);

    expect(result.status).toBe(CheckoutStatus.Cancelled);
    expect(checkoutSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'checkout-1',
        status: CheckoutStatus.Cancelled,
        cancelledReason: 'user',
      }),
    );
    expect(restoreItemsFromOrder).toHaveBeenCalledWith('visitor-1', [{ productId: 'product-1', qty: 2 }]);
  });

  it('cancels checkout without items and skips cart restore', async () => {
    const checkout = asCheckout({
      id: 'checkout-1',
      orderId: 'order-1',
      visitorSessionId: 'visitor-1',
      status: CheckoutStatus.InProgress,
      cancelledReason: null,
      createdAt: new Date(),
      expiresAt: futureExpiresAt(),
      order: {
        id: 'order-1',
        status: OrderStatus.Draft,
        items: [],
        delivery: null,
        totalMinor: 1000,
        currency: 'UAH',
        firstName: null,
        lastName: null,
        phone: null,
        createdAt: new Date(),
      },
    });

    const cancelled = asCheckout({
      ...checkout,
      status: CheckoutStatus.Cancelled,
      cancelledReason: 'user',
    });
    checkoutsFindOne.mockResolvedValueOnce(checkout).mockResolvedValueOnce(cancelled);

    const result = await service.cancelCheckout('checkout-1', 'visitor-1', CheckoutCancelledReason.User);

    expect(result.status).toBe(CheckoutStatus.Cancelled);
    expect(checkoutSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'checkout-1',
        status: CheckoutStatus.Cancelled,
        cancelledReason: 'user',
      }),
    );
    expect(restoreItemsFromOrder).not.toHaveBeenCalled();
  });

  it('no-ops stale expiry when there are no hold-elapsed checkouts', async () => {
    checkoutsFind.mockResolvedValue([]);

    await service.expireStaleCheckouts();

    expect(checkoutSave).not.toHaveBeenCalled();
    expect(restoreItemsFromOrder).not.toHaveBeenCalled();
  });

  it('returns cancelled checkout items to cart on expiry', async () => {
    const stale = asCheckout({
      id: 'checkout-1',
      orderId: 'order-1',
      visitorSessionId: 'visitor-1',
      status: CheckoutStatus.InProgress,
      cancelledReason: null,
      createdAt: new Date('2020-01-01'),
      expiresAt: pastExpiresAt(),
      order: {
        id: 'order-1',
        items: [{ productId: 'product-1', qty: 2 }],
      },
    });
    const cancelled = asCheckout({
      ...stale,
      status: CheckoutStatus.Cancelled,
      cancelledReason: 'expired',
    });
    checkoutsFind.mockResolvedValue([stale]);
    checkoutsFindOne.mockResolvedValueOnce(stale).mockResolvedValueOnce(cancelled);

    await service.expireStaleCheckouts();

    expect(restoreItemsFromOrder).toHaveBeenCalledWith('visitor-1', [{ productId: 'product-1', qty: 2 }]);
    expect(checkoutSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'checkout-1',
        status: CheckoutStatus.Cancelled,
        cancelledReason: 'expired',
      }),
    );
  });

  it('regresses order items and rejects submit when inventory changed', async () => {
    checkoutsFindOne.mockResolvedValue(
      asCheckout({
        id: 'checkout-1',
        orderId: 'order-1',
        visitorSessionId: 'visitor-1',
        status: CheckoutStatus.InProgress,
        cancelledReason: null,
        createdAt: new Date(),
        expiresAt: futureExpiresAt(),
        order: {
          id: 'order-1',
          status: OrderStatus.Draft,
          items: [
            {
              id: 'line-1',
              productId: 'product-1',
              titleSnapshot: 'Pocky',
              qty: 2,
              priceMinorSnapshot: 9_900,
            },
          ],
          delivery: null,
          totalMinor: 19_800,
          currency: 'UAH',
          firstName: null,
          lastName: null,
          phone: null,
          createdAt: new Date(),
        },
      }),
    );

    getGrossQtyBatch.mockResolvedValue(new Map([['product-1', 1]]));
    reconcileLines.mockImplementation((lines: Array<{ productId: string; qty: number }>) => {
      lines[0]!.qty = 1;
      return { changed: true };
    });

    await expect(
      service.submitCheckout('checkout-1', 'visitor-1', {
        firstName: 'Andrii',
        lastName: 'Fedak',
        phone: '+380501112233',
        delivery,
      }),
    ).rejects.toBeInstanceOf(OrderInventoryChangedException);

    expect(itemUpdate).toHaveBeenCalledWith({ id: 'line-1' }, { qty: 1 });
    expect(orderUpdate).toHaveBeenCalledWith({ id: 'order-1' }, { totalMinor: 9_900 });
    expect(deductOnSubmit).not.toHaveBeenCalled();
  });

  it('submits checkout and notifies Telegram', async () => {
    checkoutsFindOne
      .mockResolvedValueOnce(
        asCheckout({
          id: 'checkout-1',
          orderId: 'order-1',
          visitorSessionId: 'visitor-1',
          status: CheckoutStatus.InProgress,
          cancelledReason: null,
          createdAt: new Date(),
          expiresAt: futureExpiresAt(),
          order: {
            id: 'order-1',
            status: OrderStatus.Draft,
            items: [{ productId: 'product-1', titleSnapshot: 'Pocky', qty: 2, priceMinorSnapshot: 9_900 }],
            delivery: null,
            totalMinor: 19_800,
            currency: 'UAH',
            firstName: null,
            lastName: null,
            phone: null,
            createdAt: new Date(),
          },
        }),
      )
      .mockResolvedValueOnce(
        asCheckout({
          id: 'checkout-1',
          orderId: 'order-1',
          visitorSessionId: 'visitor-1',
          status: CheckoutStatus.Completed,
          expiresAt: futureExpiresAt(),
          order: {
            id: 'order-1',
            status: OrderStatus.New,
            items: [{ titleSnapshot: 'Pocky', qty: 2, priceMinorSnapshot: 9_900 }],
            delivery: {
              provider: DeliveryProvider.NovaPoshta,
              method: DeliveryMethod.Warehouse,
              city: 'Київ',
              warehouseNumber: '1',
              warehouseName: 'Відділення №1',
              warehouseRef: null,
              street: null,
              building: null,
              apartment: null,
              notes: null,
            },
            totalMinor: 19_800,
            currency: 'UAH',
            firstName: 'Andrii',
            lastName: 'Fedak',
            phone: '+380501112233',
            createdAt: new Date(),
          },
        }),
      );

    const result = await service.submitCheckout('checkout-1', 'visitor-1', {
      firstName: 'Andrii',
      lastName: 'Fedak',
      phone: '+380501112233',
      delivery,
    });

    expect(result.status).toBe(OrderStatus.New);
    expect(checkoutSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'checkout-1',
        status: CheckoutStatus.Completed,
      }),
    );
    expect(deductOnSubmit).toHaveBeenCalled();
    expect(estimateFromDelivery).toHaveBeenCalled();
    expect(applyEstimateSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'Київ', warehouseNumber: '1' }),
      expect.objectContaining({ estimatedDaysMin: 2, estimatedDaysMax: 3, shippingCostMinor: 6_500 }),
    );
    expect(telegramSend).toHaveBeenCalled();
  });

  it('rejects submit when checkout is not found', async () => {
    checkoutsFindOne.mockResolvedValueOnce(null);

    await expect(
      service.submitCheckout('checkout-1', 'visitor-1', {
        firstName: 'Andrii',
        lastName: 'Fedak',
        phone: '+380501112233',
        delivery,
      }),
    ).rejects.toBeInstanceOf(CheckoutNotFoundException);

    expect(deductOnSubmit).not.toHaveBeenCalled();
    expect(telegramSend).not.toHaveBeenCalled();
  });

  it('rejects submit when checkout hold has elapsed', async () => {
    const elapsed = asCheckout({
      id: 'checkout-1',
      orderId: 'order-1',
      visitorSessionId: 'visitor-1',
      status: CheckoutStatus.InProgress,
      cancelledReason: null,
      createdAt: new Date(),
      expiresAt: pastExpiresAt(),
      order: {
        id: 'order-1',
        status: OrderStatus.Draft,
        items: [{ productId: 'product-1', titleSnapshot: 'Pocky', qty: 1, priceMinorSnapshot: 9_900 }],
        delivery: null,
        totalMinor: 9_900,
        currency: 'UAH',
        firstName: 'Andrii',
        lastName: 'Fedak',
        phone: '+380501112233',
        createdAt: new Date(),
      },
    });
    const cancelled = asCheckout({
      ...elapsed,
      status: CheckoutStatus.Cancelled,
      cancelledReason: 'expired',
    });
    checkoutsFindOne
      .mockResolvedValueOnce(elapsed)
      .mockResolvedValueOnce(elapsed)
      .mockResolvedValueOnce(cancelled);

    await expect(
      service.submitCheckout('checkout-1', 'visitor-1', {
        firstName: 'Andrii',
        lastName: 'Fedak',
        phone: '+380501112233',
        delivery,
      }),
    ).rejects.toBeInstanceOf(CheckoutInactiveException);

    expect(checkoutSave).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'checkout-1',
        status: CheckoutStatus.Cancelled,
        cancelledReason: 'expired',
      }),
    );
    expect(restoreItemsFromOrder).toHaveBeenCalledWith('visitor-1', [{ productId: 'product-1', qty: 1 }]);
    expect(deductOnSubmit).not.toHaveBeenCalled();
    expect(telegramSend).not.toHaveBeenCalled();
  });
});
