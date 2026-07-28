import { CheckoutCalculator } from '@/application/checkouts';
import { Checkout } from '@/application/checkouts/checkout.entity';
import { Order } from '@/application/orders';
import { OrderDelivery } from '@/application/orders/order-delivery.entity';

import { describe, expect, it } from '../jest-globals';

describe('CheckoutCalculator', () => {
  const calculator = new CheckoutCalculator();

  it('sums priced lines', () => {
    expect(
      calculator.sumLines([
        { unitMinor: 1_000, qty: 2 },
        { unitMinor: 500, qty: 3 },
      ]),
    ).toBe(3_500);
  });

  it('leaves grandTotalMinor as products total when there is no estimate', () => {
    const checkout = Object.assign(new Checkout(), {
      deliveryEstimate: null,
      order: Object.assign(new Order(), {
        totalMinor: 9_900,
        delivery: Object.assign(new OrderDelivery(), { shippingCostMinor: null }),
      }),
    });

    calculator.calculateTotals(checkout);

    expect(checkout.order.grandTotalMinor).toBe(9_900);
  });

  it('mirrors estimate shipping onto delivery so grandTotalMinor includes it', () => {
    const checkout = Object.assign(new Checkout(), {
      deliveryEstimate: {
        estimatedDeliveryAt: '2026-07-20T00:00:00.000Z',
        estimatedDaysMin: 1,
        estimatedDaysMax: 2,
        shippingCostMinor: 650,
      },
      order: Object.assign(new Order(), {
        totalMinor: 9_900,
        delivery: Object.assign(new OrderDelivery(), { shippingCostMinor: null }),
      }),
    });

    calculator.calculateTotals(checkout);

    expect(checkout.order.delivery?.shippingCostMinor).toBe(650);
    expect(checkout.order.grandTotalMinor).toBe(10_550);
  });

  it('keeps grandTotalMinor as products total when estimate has null shipping cost', () => {
    const checkout = Object.assign(new Checkout(), {
      deliveryEstimate: {
        estimatedDeliveryAt: '2026-07-20T00:00:00.000Z',
        estimatedDaysMin: 1,
        estimatedDaysMax: 2,
        shippingCostMinor: null,
      },
      order: Object.assign(new Order(), {
        totalMinor: 9_900,
        delivery: Object.assign(new OrderDelivery(), { shippingCostMinor: 100 }),
      }),
    });

    calculator.calculateTotals(checkout);

    expect(checkout.order.delivery?.shippingCostMinor).toBeNull();
    expect(checkout.order.grandTotalMinor).toBe(9_900);
  });
});
