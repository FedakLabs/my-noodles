export const ROUTE_NAMES = {
  login: '/login',
  orders: '/orders',
  orderDetail: '/orders/$orderId',
} as const;

export function orderDetailPath(orderId: string): string {
  return `/orders/${orderId}`;
}
