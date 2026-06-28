import { type InventoryService } from '@/application/inventory/inventory.service';
import { OrderCancelledReason } from '@/application/orders/order-cancelled-reason';
import { OrderStatus } from '@/application/orders/order-status';
import {
  OrderCancelNotAllowedException,
  OrderNotFoundException,
} from '@/application/orders/orders.exceptions';
import { OrdersService } from '@/application/orders/orders.service';

import { jest } from '../jest-globals';

describe('OrdersService', () => {
  let ordersFindOne: jest.Mock;
  let orderSave: jest.Mock;
  let restoreOnCancel: jest.Mock;
  let service: OrdersService;

  beforeEach(() => {
    ordersFindOne = jest.fn();
    orderSave = jest.fn((entity: object) => Promise.resolve(entity));
    restoreOnCancel = jest.fn().mockResolvedValue(undefined);

    service = new OrdersService(
      { findOne: ordersFindOne, save: orderSave } as never,
      { restoreOnCancel } as unknown as InventoryService,
    );
  });

  it('cancels a submitted order and restores inventory', async () => {
    const order = {
      id: 'order-1',
      status: OrderStatus.New,
      cancelledReason: null,
      totalMinor: 9_900,
      currency: 'UAH',
      createdAt: new Date('2025-06-20T10:00:00.000Z'),
      items: [{ productId: 'product-1', qty: 2 }],
    };

    ordersFindOne.mockResolvedValue(order);

    const result = await service.cancelSubmittedOrder('order-1', OrderCancelledReason.OutOfStock);

    expect(result.status).toBe(OrderStatus.Cancelled);
    expect(restoreOnCancel).toHaveBeenCalledWith([{ productId: 'product-1', qty: 2 }]);
    expect(orderSave).toHaveBeenCalledWith(
      expect.objectContaining({
        status: OrderStatus.Cancelled,
        cancelledReason: OrderCancelledReason.OutOfStock,
      }),
    );
  });

  it('rejects manager cancel on draft orders', async () => {
    ordersFindOne.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.Draft,
      items: [],
    });

    await expect(
      service.cancelSubmittedOrder('order-1', OrderCancelledReason.CustomerRequest),
    ).rejects.toBeInstanceOf(OrderCancelNotAllowedException);
    expect(restoreOnCancel).not.toHaveBeenCalled();
  });

  it('throws when order is missing', async () => {
    ordersFindOne.mockResolvedValue(null);

    await expect(
      service.cancelSubmittedOrder('order-1', OrderCancelledReason.CustomerRequest),
    ).rejects.toBeInstanceOf(OrderNotFoundException);
  });

  it('returns idempotently when order is already cancelled', async () => {
    ordersFindOne.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.Cancelled,
      totalMinor: 9_900,
      currency: 'UAH',
      createdAt: new Date('2025-06-20T10:00:00.000Z'),
      items: [{ productId: 'product-1', qty: 1 }],
    });

    const result = await service.cancelSubmittedOrder('order-1', OrderCancelledReason.CustomerRequest);

    expect(result.status).toBe(OrderStatus.Cancelled);
    expect(restoreOnCancel).not.toHaveBeenCalled();
    expect(orderSave).not.toHaveBeenCalled();
  });
});
