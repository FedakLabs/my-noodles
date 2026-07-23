import { OrderTransitionNotAllowedException } from '@/application/admin/orders/admin-orders.exceptions';
import { AdminOrdersService } from '@/application/admin/orders/admin-orders.service';
import { OrderCancelledReason } from '@/application/orders/order-cancelled-reason';
import { OrderStatus } from '@/application/orders/order-status';
import { OrderNotFoundException } from '@/application/orders/orders.exceptions';
import { type OrdersService } from '@/application/orders/orders.service';

import { jest } from '../jest-globals';

describe('AdminOrdersService', () => {
  let ordersFindOne: jest.Mock;
  let orderSave: jest.Mock;
  let cancelSubmittedOrder: jest.Mock;
  let service: AdminOrdersService;

  beforeEach(() => {
    ordersFindOne = jest.fn();
    orderSave = jest.fn((entity: object) => Promise.resolve(entity));
    cancelSubmittedOrder = jest.fn();

    service = new AdminOrdersService(
      {
        findOne: ordersFindOne,
        save: orderSave,
      } as never,
      { cancelSubmittedOrder } as unknown as OrdersService,
    );
  });

  it('confirms a new order', async () => {
    const order = {
      id: 'order-1',
      status: OrderStatus.New,
      totalMinor: 9_900,
      currency: 'UAH',
      delivery: null,
      statusHistory: [],
    };
    ordersFindOne.mockResolvedValue(order);

    const result = await service.confirm('order-1');

    expect(result.status).toBe(OrderStatus.Confirmed);
    expect(result.availableTransitions).toEqual([OrderStatus.Sent, OrderStatus.Cancelled]);
    expect(orderSave).toHaveBeenCalledWith(expect.objectContaining({ status: OrderStatus.Confirmed }));
  });

  it('rejects confirm when transition is not allowed', async () => {
    ordersFindOne.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.Completed,
      totalMinor: 9_900,
      currency: 'UAH',
      statusHistory: [],
    });

    await expect(service.confirm('order-1')).rejects.toBeInstanceOf(OrderTransitionNotAllowedException);
    expect(orderSave).not.toHaveBeenCalled();
  });

  it('rejects actions on draft orders as not found', async () => {
    ordersFindOne.mockResolvedValue({
      id: 'order-1',
      status: OrderStatus.Draft,
      totalMinor: 0,
      currency: 'UAH',
      statusHistory: [],
    });

    await expect(service.send('order-1')).rejects.toBeInstanceOf(OrderNotFoundException);
  });

  it('cancels via OrdersService with reason', async () => {
    const cancelled = {
      id: 'order-1',
      status: OrderStatus.Cancelled,
      totalMinor: 9_900,
      currency: 'UAH',
      cancelledReason: OrderCancelledReason.CustomerRequest,
      delivery: null,
      statusHistory: [],
    };
    cancelSubmittedOrder.mockResolvedValue(cancelled);

    const result = await service.cancel('order-1', OrderCancelledReason.CustomerRequest);

    expect(cancelSubmittedOrder).toHaveBeenCalledWith('order-1', OrderCancelledReason.CustomerRequest);
    expect(result.status).toBe(OrderStatus.Cancelled);
    expect(result.availableTransitions).toEqual([OrderStatus.Archived]);
  });
});
