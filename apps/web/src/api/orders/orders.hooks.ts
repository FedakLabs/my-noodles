'use client';

import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { ordersQueries } from './orders';

export function useOrder(orderId: string) {
  return formatUseQuery(useQuery(ordersQueries.detail(orderId)), 'order');
}
