import type { Checkout } from './checkout.entity';

type PricedLine = {
  unitMinor: number;
  qty: number;
};

export class CheckoutCalculator {
  /**
   * Mirror live estimate shipping onto the in-memory delivery so {@link Order.grandTotalMinor} resolves.
   */
  calculateTotals(checkout: Checkout): Checkout {
    const { order, deliveryEstimate } = checkout;
    if (order.delivery && deliveryEstimate) {
      order.delivery.shippingCostMinor = deliveryEstimate.shippingCostMinor;
    }

    return checkout;
  }

  sumLines(lines: ReadonlyArray<PricedLine>): number {
    return lines.reduce((sum, line) => sum + line.unitMinor * line.qty, 0);
  }
}
