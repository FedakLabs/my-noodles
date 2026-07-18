import { CheckoutCalculator } from '@/application/checkouts';
import { Checkout } from '@/application/checkouts/checkout.entity';
import { Order } from '@/application/orders';

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

  it('sets grandTotalMinor to products total when there is no estimate', () => {
    const checkout = Object.assign(new Checkout(), {
      deliveryEstimate: null,
      order: Object.assign(new Order(), {
        totalMinor: 9_900,
      }),
    });

    calculator.calculateTotals(checkout);

    expect(checkout.order.grandTotalMinor).toBe(9_900);
  });

  it('adds shipping into grandTotalMinor when estimate is present', () => {
    const checkout = Object.assign(new Checkout(), {
      deliveryEstimate: {
        estimatedDeliveryAt: '2026-07-20T00:00:00.000Z',
        estimatedDaysMin: 1,
        estimatedDaysMax: 2,
        shippingCostMinor: 650,
      },
      order: Object.assign(new Order(), {
        totalMinor: 9_900,
      }),
    });

    calculator.calculateTotals(checkout);

    expect(checkout.order.grandTotalMinor).toBe(10_550);
  });
});
