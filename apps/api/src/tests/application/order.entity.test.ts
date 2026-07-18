import { Order, OrderStatus } from '@/application/orders';

import { describe, expect, it } from '../jest-globals';

describe('Order entity', () => {
  it('defaults status to draft on insert', () => {
    const order = new Order();

    order.setDefaultStatus();

    expect(order.status).toBe(OrderStatus.Draft);
  });

  it('keeps an explicit status on insert', () => {
    const order = Object.assign(new Order(), { status: OrderStatus.New });

    order.setDefaultStatus();

    expect(order.status).toBe(OrderStatus.New);
  });
});
