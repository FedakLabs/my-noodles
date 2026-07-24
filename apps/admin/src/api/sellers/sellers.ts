import {
  adminSellersControllerCreate,
  adminSellersControllerGetById,
  adminSellersControllerList,
  adminSellersControllerUpdate,
  type CreateSellerDto,
  type Seller,
  type UpdateSellerDto,
} from '@my-noodles/api-clients/admin';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

export type SellersListParams = {
  page: number;
  limit: number;
  q?: string;
};

export const sellersQueries = {
  rootKey: ['sellers'] as const,
  /** Root key — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: sellersQueries.rootKey,
    }),
  list: (params: SellersListParams) =>
    queryOptions({
      queryKey: [...sellersQueries.rootKey, 'list', params] as const,
      queryFn: () =>
        adminSellersControllerList({
          query: {
            page: params.page,
            limit: params.limit,
            q: params.q,
          },
        }),
    }),
  detail: (sellerId: string) =>
    queryOptions({
      queryKey: [...sellersQueries.rootKey, 'detail', sellerId] as const,
      queryFn: () =>
        adminSellersControllerGetById({
          path: { id: sellerId },
        }) as Promise<Seller>,
    }),
};

export const sellersMutations = {
  rootKey: sellersQueries.rootKey,
  create: () =>
    mutationOptions({
      mutationKey: [...sellersMutations.rootKey, 'create'] as const,
      mutationFn: (body: CreateSellerDto) => adminSellersControllerCreate({ body }),
    }),
  update: (sellerId: string) =>
    mutationOptions({
      mutationKey: [...sellersMutations.rootKey, 'update', sellerId] as const,
      mutationFn: (body: UpdateSellerDto) =>
        adminSellersControllerUpdate({
          path: { id: sellerId },
          body,
        }),
    }),
};
