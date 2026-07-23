import {
  adminOrdersControllerArchiveOrder,
  adminOrdersControllerArriveOrder,
  adminOrdersControllerCancelOrder,
  adminOrdersControllerCompleteOrder,
  adminOrdersControllerConfirmOrder,
  adminOrdersControllerGetOrder,
  adminOrdersControllerListOrders,
  adminOrdersControllerReturnOrder,
  adminOrdersControllerSendOrder,
  type AdminOrder,
  type AdminOrdersSortBy,
  type AdminOrdersSortOrder,
  type OrderCancelledReason,
  type OrderStatus,
} from '@my-noodles/api-clients/admin';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

export type OrdersListParams = {
  page: number;
  limit: number;
  status?: OrderStatus[];
  q?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: AdminOrdersSortBy;
  sortOrder?: AdminOrdersSortOrder;
};

type CancelOrderVariables = {
  cancelledReason: OrderCancelledReason;
};

export const ordersQueries = {
  rootKey: ['orders'] as const,
  /** Root key — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: ordersQueries.rootKey,
    }),
  list: (params: OrdersListParams) =>
    queryOptions({
      queryKey: [...ordersQueries.rootKey, 'list', params] as const,
      queryFn: () =>
        adminOrdersControllerListOrders({
          query: {
            page: params.page,
            limit: params.limit,
            status: params.status,
            q: params.q,
            createdFrom: params.createdFrom,
            createdTo: params.createdTo,
            sortBy: params.sortBy,
            sortOrder: params.sortOrder,
          },
        }),
    }),
  detail: (orderId: string) =>
    queryOptions({
      queryKey: [...ordersQueries.rootKey, 'detail', orderId] as const,
      queryFn: () =>
        adminOrdersControllerGetOrder({
          path: { id: orderId },
        }) as Promise<AdminOrder>,
    }),
};

export const ordersMutations = {
  rootKey: ordersQueries.rootKey,
  confirm: (orderId: string) =>
    mutationOptions({
      mutationKey: [...ordersMutations.rootKey, 'confirm', orderId] as const,
      mutationFn: () =>
        adminOrdersControllerConfirmOrder({
          path: { id: orderId },
        }),
    }),
  send: (orderId: string) =>
    mutationOptions({
      mutationKey: [...ordersMutations.rootKey, 'send', orderId] as const,
      mutationFn: () =>
        adminOrdersControllerSendOrder({
          path: { id: orderId },
        }),
    }),
  arrive: (orderId: string) =>
    mutationOptions({
      mutationKey: [...ordersMutations.rootKey, 'arrive', orderId] as const,
      mutationFn: () =>
        adminOrdersControllerArriveOrder({
          path: { id: orderId },
        }),
    }),
  complete: (orderId: string) =>
    mutationOptions({
      mutationKey: [...ordersMutations.rootKey, 'complete', orderId] as const,
      mutationFn: () =>
        adminOrdersControllerCompleteOrder({
          path: { id: orderId },
        }),
    }),
  cancel: (orderId: string) =>
    mutationOptions({
      mutationKey: [...ordersMutations.rootKey, 'cancel', orderId] as const,
      mutationFn: (body: CancelOrderVariables) =>
        adminOrdersControllerCancelOrder({
          path: { id: orderId },
          body,
        }),
    }),
  return: (orderId: string) =>
    mutationOptions({
      mutationKey: [...ordersMutations.rootKey, 'return', orderId] as const,
      mutationFn: () =>
        adminOrdersControllerReturnOrder({
          path: { id: orderId },
        }),
    }),
  archive: (orderId: string) =>
    mutationOptions({
      mutationKey: [...ordersMutations.rootKey, 'archive', orderId] as const,
      mutationFn: () =>
        adminOrdersControllerArchiveOrder({
          path: { id: orderId },
        }),
    }),
};
