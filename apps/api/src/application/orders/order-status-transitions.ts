import { OrderStatus } from './order-status';

/**
 * Allowed admin-driven status transitions.
 * Checkout submit still owns draft → new outside this map.
 */
const ORDER_STATUS_TRANSITIONS: Readonly<Partial<Record<OrderStatus, readonly OrderStatus[]>>> = {
  [OrderStatus.New]: [OrderStatus.Confirmed, OrderStatus.Cancelled],
  [OrderStatus.Confirmed]: [OrderStatus.Sent, OrderStatus.Cancelled],
  [OrderStatus.Sent]: [OrderStatus.Arrived, OrderStatus.Cancelled],
  [OrderStatus.Arrived]: [OrderStatus.Completed, OrderStatus.Cancelled],
  [OrderStatus.Completed]: [OrderStatus.Returned, OrderStatus.Archived],
  [OrderStatus.Cancelled]: [OrderStatus.Archived],
  [OrderStatus.Returned]: [OrderStatus.Archived],
};

export function availableOrderTransitions(from: OrderStatus): OrderStatus[] {
  return [...(ORDER_STATUS_TRANSITIONS[from] ?? [])];
}

export function isOrderTransitionAllowed(from: OrderStatus, to: OrderStatus): boolean {
  return availableOrderTransitions(from).includes(to);
}
