import { CartEmptyException } from '@/application/cart/cart.exceptions';
import { CheckoutsService, CheckoutStatus } from '@/application/checkouts';
import { Checkout } from '@/application/checkouts/checkout.entity';
import {
  CheckoutExpiredException,
  CheckoutNotInProgressException,
} from '@/application/checkouts/checkouts.exceptions';
import { type InventoryService } from '@/application/inventory/inventory.service';
import { DeliveryMethod, DeliveryProvider, OrderStatus } from '@/application/orders';
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
  let itemUpdate: jest.Mock;
  let itemDelete: jest.Mock;
  let telegramSend: jest.Mock;
  let getCartItemsForOrder: jest.Mock;
  let clearCartItems: jest.Mock;
  let restoreItemsFromOrder: jest.Mock;
  let applyReconciledQuantities: jest.Mock;
  let orderFindOne: jest.Mock;
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
    checkoutSave = jest.fn().mockImplementation((entity: object) =>
      Promise.resolve(
        asCheckout({
          id: 'checkout-1',
          orderId: 'order-1',
          createdAt: new Date('2025-06-20T10:00:00.000Z'),
          expiresAt: futureExpiresAt(),
          status: CheckoutStatus.InProgress,
          ...entity,
        }),
      ),
    );
    const checkoutCreate = jest.fn().mockImplementation((entity: object) => entity);
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

    deliverySave = jest.fn().mockResolvedValue({});
    itemSave = jest.fn().mockResolvedValue([]);
    itemUpdate = jest.fn().mockResolvedValue(undefined);
    itemDelete = jest.fn().mockResolvedValue(undefined);
    orderUpdate = jest.fn().mockResolvedValue(undefined);
    checkoutsFindOne = jest.fn().mockResolvedValue(null);
    checkoutsFind = jest.fn().mockResolvedValue([]);
    transaction = jest.fn(async (callback: () => Promise<unknown>) => callback());
    getCartItemsForOrder = jest.fn().mockResolvedValue([
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
    orderFindOne = jest.fn().mockResolvedValue({ id: 'order-1', items: [] });
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
      { save: orderSave, update: orderUpdate, findOne: orderFindOne } as never,
      { save: deliverySave } as never,
      { save: itemSave, update: itemUpdate, delete: itemDelete } as never,
      { getCartItemsForOrder, clearCartItems, restoreItemsFromOrder, applyReconciledQuantities } as never,
      {
        getAvailableQtyBatch,
        getGrossQtyBatch,
        reconcileLines,
        deductOnSubmit,
      } as unknown as InventoryService,
      { sendOrderNotification: telegramSend } as never,
      { estimateForOrder, canEstimate, estimateFromDelivery, applyEstimateSnapshot } as never,
      { error: jest.fn(), info: jest.fn() } as never,
    );
  });

  it('starts checkout from cart items', async () => {
    const result = await service.startFromCart('visitor-1');

    expect(result.id).toBe('checkout-1');
    expect(result.orderId).toBe('order-1');
    expect(result.totalMinor).toBe(19_800);
    expect(reconcileLines).toHaveBeenCalled();
    expect(clearCartItems).toHaveBeenCalledWith('visitor-1');
    expect(itemSave).toHaveBeenCalled();
    expect(checkoutSave).toHaveBeenCalledWith(
      expect.objectContaining({
        status: CheckoutStatus.InProgress,
        completedAt: null,
        expiresAt: expect.any(Date),
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

    const result = await service.startFromCart('visitor-1');

    expect(result.id).toBe('checkout-existing');
    expect(result.orderId).toBe('order-existing');
    expect(result.totalMinor).toBe(29_700);
    expect(itemSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'line-1', qty: 3, priceMinorSnapshot: 9_900 }),
    );
    expect(orderSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'order-existing', totalMinor: 29_700 }),
    );
    expect(checkoutSave).toHaveBeenCalledWith(existingCheckout);
    expect(clearCartItems).toHaveBeenCalledWith('visitor-1');
  });

  it('creates a new checkout when the in-progress checkout is expired', async () => {
    checkoutsFindOne.mockResolvedValueOnce(
      asCheckout({
        id: 'checkout-expired',
        orderId: 'order-expired',
        visitorSessionId: 'visitor-1',
        status: CheckoutStatus.InProgress,
        cancelledReason: null,
        createdAt: new Date('2020-01-01'),
        expiresAt: pastExpiresAt(),
        order: {
          id: 'order-expired',
          items: [{ productId: 'product-1', qty: 1 }],
        },
      }),
    );
    orderFindOne.mockResolvedValueOnce({
      id: 'order-expired',
      items: [{ productId: 'product-1', qty: 1 }],
    });

    const result = await service.startFromCart('visitor-1');

    expect(result.id).toBe('checkout-1');
    expect(result.orderId).toBe('order-1');
    expect(checkoutUpdate).toHaveBeenCalledWith(
      { id: 'checkout-expired', status: CheckoutStatus.InProgress },
      { status: CheckoutStatus.Cancelled, cancelledReason: 'expired' },
    );
    expect(restoreItemsFromOrder).toHaveBeenCalledWith('visitor-1', [{ productId: 'product-1', qty: 1 }]);
  });

  it('rejects checkout start when cart is empty', async () => {
    getCartItemsForOrder.mockResolvedValueOnce([]);

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

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      id: 'checkout-1',
      itemCount: 3,
      totalMinor: 19_800,
      status: CheckoutStatus.InProgress,
      expiresAt: expiresAt.toISOString(),
    });
    expect(checkoutsFind).toHaveBeenCalled();
  });

  it('rejects checkout detail when checkout is cancelled', async () => {
    checkoutsFindOne.mockResolvedValue(
      asCheckout({
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
      }),
    );

    await expect(service.getCheckout('checkout-1', 'visitor-1')).rejects.toBeInstanceOf(
      CheckoutNotInProgressException,
    );
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

    checkoutsFindOne
      .mockResolvedValueOnce(checkout)
      .mockResolvedValueOnce(asCheckout({ ...checkout, status: CheckoutStatus.Cancelled }));

    const result = await service.cancelCheckout('checkout-1', 'visitor-1');

    expect(result.status).toBe(CheckoutStatus.Cancelled);
    expect(checkoutUpdate).toHaveBeenCalledWith(
      { id: 'checkout-1', status: CheckoutStatus.InProgress },
      { status: CheckoutStatus.Cancelled, cancelledReason: 'user' },
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

    checkoutsFindOne
      .mockResolvedValueOnce(checkout)
      .mockResolvedValueOnce(asCheckout({ ...checkout, status: CheckoutStatus.Cancelled }));

    const result = await service.cancelCheckout('checkout-1', 'visitor-1');

    expect(result.status).toBe(CheckoutStatus.Cancelled);
    expect(checkoutUpdate).toHaveBeenCalledWith(
      { id: 'checkout-1', status: CheckoutStatus.InProgress },
      { status: CheckoutStatus.Cancelled, cancelledReason: 'user' },
    );
    expect(restoreItemsFromOrder).not.toHaveBeenCalled();
  });

  it('skips cart restore when cancel loses the atomic status flip', async () => {
    checkoutUpdate.mockResolvedValueOnce({ affected: 0 });

    checkoutsFind.mockResolvedValue([
      asCheckout({
        id: 'checkout-1',
        orderId: 'order-1',
        visitorSessionId: 'visitor-1',
        status: CheckoutStatus.InProgress,
        cancelledReason: null,
        createdAt: new Date(),
        expiresAt: pastExpiresAt(),
        order: {
          id: 'order-1',
          items: [{ productId: 'product-1', qty: 2 }],
        },
      }),
    ]);

    await service.expireStaleCheckouts();

    expect(checkoutUpdate).toHaveBeenCalled();
    expect(restoreItemsFromOrder).not.toHaveBeenCalled();
  });

  it('returns cancelled checkout items to cart on expiry', async () => {
    checkoutsFind.mockResolvedValue([
      asCheckout({
        id: 'checkout-1',
        orderId: 'order-1',
        visitorSessionId: 'visitor-1',
        status: CheckoutStatus.InProgress,
        cancelledReason: null,
        createdAt: new Date('2020-01-01'),
        expiresAt: pastExpiresAt(),
      }),
    ]);
    orderFindOne.mockResolvedValue({
      id: 'order-1',
      items: [{ productId: 'product-1', qty: 2 }],
    });

    await service.expireStaleCheckouts();

    expect(restoreItemsFromOrder).toHaveBeenCalledWith('visitor-1', [{ productId: 'product-1', qty: 2 }]);
    expect(checkoutUpdate).toHaveBeenCalledWith(
      { id: 'checkout-1', status: CheckoutStatus.InProgress },
      { status: CheckoutStatus.Cancelled, cancelledReason: 'expired' },
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
    expect(checkoutUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'checkout-1',
        status: CheckoutStatus.InProgress,
      }),
      expect.objectContaining({
        status: CheckoutStatus.Completed,
        cancelledReason: null,
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

  it('returns completed order without deducting when submit loses the atomic flip', async () => {
    const completedOrder = {
      id: 'order-1',
      status: OrderStatus.New,
      items: [{ titleSnapshot: 'Pocky', qty: 2, priceMinorSnapshot: 9_900 }],
      delivery: null,
      totalMinor: 19_800,
      currency: 'UAH',
      firstName: 'Andrii',
      lastName: 'Fedak',
      phone: '+380501112233',
      createdAt: new Date(),
    };

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
            ...completedOrder,
            status: OrderStatus.Draft,
            firstName: null,
            lastName: null,
            phone: null,
            items: [{ productId: 'product-1', titleSnapshot: 'Pocky', qty: 2, priceMinorSnapshot: 9_900 }],
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
          order: completedOrder,
        }),
      )
      .mockResolvedValueOnce(
        asCheckout({
          id: 'checkout-1',
          orderId: 'order-1',
          visitorSessionId: 'visitor-1',
          status: CheckoutStatus.Completed,
          expiresAt: futureExpiresAt(),
          order: completedOrder,
        }),
      );

    checkoutUpdate.mockResolvedValueOnce({ affected: 0 });

    const result = await service.submitCheckout('checkout-1', 'visitor-1', {
      firstName: 'Andrii',
      lastName: 'Fedak',
      phone: '+380501112233',
      delivery,
    });

    expect(result.status).toBe(OrderStatus.New);
    expect(deductOnSubmit).not.toHaveBeenCalled();
    expect(telegramSend).not.toHaveBeenCalled();
  });

  it('rejects submit when checkout expired during the atomic flip', async () => {
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
          status: CheckoutStatus.InProgress,
          cancelledReason: null,
          createdAt: new Date(),
          expiresAt: pastExpiresAt(),
          order: {
            id: 'order-1',
            status: OrderStatus.Draft,
            items: [{ productId: 'product-1', qty: 2 }],
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

    checkoutUpdate.mockResolvedValueOnce({ affected: 0 }).mockResolvedValueOnce({ affected: 1 });

    await expect(
      service.submitCheckout('checkout-1', 'visitor-1', {
        firstName: 'Andrii',
        lastName: 'Fedak',
        phone: '+380501112233',
        delivery,
      }),
    ).rejects.toBeInstanceOf(CheckoutExpiredException);

    expect(deductOnSubmit).not.toHaveBeenCalled();
    expect(checkoutUpdate).toHaveBeenCalledWith(
      { id: 'checkout-1', status: CheckoutStatus.InProgress },
      { status: CheckoutStatus.Cancelled, cancelledReason: 'expired' },
    );
  });
});
