import type { Checkout } from './checkout.entity';

type PricedLine = {
  unitMinor: number;
  qty: number;
};

export class CheckoutCalculator {
  calculateTotals(checkout: Checkout): Checkout {
    const { order } = checkout;
    const shippingCostMinor = checkout.deliveryEstimate?.shippingCostMinor;

    order.grandTotalMinor =
      shippingCostMinor != null ? order.totalMinor + shippingCostMinor : order.totalMinor;

    return checkout;
  }

  sumLines(lines: ReadonlyArray<PricedLine>): number {
    return lines.reduce((sum, line) => sum + line.unitMinor * line.qty, 0);
  }
}
