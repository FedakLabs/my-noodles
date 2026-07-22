import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { ordersMutations, ordersQueries } from './orders';
import type { OrdersListParams } from './types';

async function invalidateOrdersTree(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: ordersQueries.all().queryKey });
}

export function useOrdersList(params: OrdersListParams) {
  return formatUseQuery(useQuery(ordersQueries.list(params)), 'orders');
}

export function useOrder(orderId: string) {
  return formatUseQuery(
    useQuery({
      ...ordersQueries.detail(orderId),
      enabled: Boolean(orderId),
    }),
    'order',
  );
}

export function useConfirmOrder(orderId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...ordersMutations.confirm(orderId),
      onSuccess: async () => {
        await invalidateOrdersTree(queryClient);
      },
    }),
    'confirmOrder',
  );
}

export function useSendOrder(orderId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...ordersMutations.send(orderId),
      onSuccess: async () => {
        await invalidateOrdersTree(queryClient);
      },
    }),
    'sendOrder',
  );
}

export function useArriveOrder(orderId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...ordersMutations.arrive(orderId),
      onSuccess: async () => {
        await invalidateOrdersTree(queryClient);
      },
    }),
    'arriveOrder',
  );
}

export function useCompleteOrder(orderId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...ordersMutations.complete(orderId),
      onSuccess: async () => {
        await invalidateOrdersTree(queryClient);
      },
    }),
    'completeOrder',
  );
}

export function useCancelOrder(orderId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...ordersMutations.cancel(orderId),
      onSuccess: async () => {
        await invalidateOrdersTree(queryClient);
      },
    }),
    'cancelOrder',
  );
}

export function useReturnOrder(orderId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...ordersMutations.return(orderId),
      onSuccess: async () => {
        await invalidateOrdersTree(queryClient);
      },
    }),
    'returnOrder',
  );
}

export function useArchiveOrder(orderId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...ordersMutations.archive(orderId),
      onSuccess: async () => {
        await invalidateOrdersTree(queryClient);
      },
    }),
    'archiveOrder',
  );
}
