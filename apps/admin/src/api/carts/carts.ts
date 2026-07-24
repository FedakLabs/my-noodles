import {
  adminCartsControllerGetByVisitorSessionId,
  adminCartsControllerList,
  type AdminCartDetailDto,
} from '@my-noodles/api-clients/admin';
import { queryOptions } from '@tanstack/react-query';

export type CartsListParams = {
  page: number;
  limit: number;
  visitorSessionId?: string;
};

export const cartsQueries = {
  rootKey: ['carts'] as const,
  all: () =>
    queryOptions({
      queryKey: cartsQueries.rootKey,
    }),
  list: (params: CartsListParams) =>
    queryOptions({
      queryKey: [...cartsQueries.rootKey, 'list', params] as const,
      queryFn: () =>
        adminCartsControllerList({
          query: {
            page: params.page,
            limit: params.limit,
            visitorSessionId: params.visitorSessionId,
          },
        }),
    }),
  detail: (visitorSessionId: string) =>
    queryOptions({
      queryKey: [...cartsQueries.rootKey, 'detail', visitorSessionId] as const,
      queryFn: () =>
        adminCartsControllerGetByVisitorSessionId({
          path: { visitorSessionId },
        }) as Promise<AdminCartDetailDto>,
    }),
};

export type { AdminCartDetailDto };
