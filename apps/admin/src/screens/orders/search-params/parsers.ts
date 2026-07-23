import type { OrderStatus } from '@my-noodles/api-clients/admin';
import { parseAsArrayOf, parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs';

export const ORDER_STATUS_FILTER_OPTIONS = [
  'new',
  'confirmed',
  'sent',
  'arrived',
  'completed',
  'cancelled',
  'returned',
  'archived',
] as const satisfies readonly OrderStatus[];

export const ordersSearchParamsParsers = {
  q: parseAsString,
  status: parseAsArrayOf(parseAsStringEnum<OrderStatus>([...ORDER_STATUS_FILTER_OPTIONS])).withDefault([]),
  createdFrom: parseAsString,
  createdTo: parseAsString,
  page: parseAsInteger.withDefault(1),
};
