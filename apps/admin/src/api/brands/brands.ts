import {
  adminBrandsControllerCreate,
  adminBrandsControllerGetById,
  adminBrandsControllerList,
  adminBrandsControllerUpdate,
  type Brand,
  type CreateBrandDto,
  type UpdateBrandDto,
} from '@my-noodles/api-clients/admin';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

export type BrandsListParams = {
  page: number;
  limit: number;
  q?: string;
};

export const brandsQueries = {
  rootKey: ['brands'] as const,
  /** Root key — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: brandsQueries.rootKey,
    }),
  list: (params: BrandsListParams) =>
    queryOptions({
      queryKey: [...brandsQueries.rootKey, 'list', params] as const,
      queryFn: () =>
        adminBrandsControllerList({
          query: {
            page: params.page,
            limit: params.limit,
            q: params.q,
          },
        }),
    }),
  detail: (brandId: string) =>
    queryOptions({
      queryKey: [...brandsQueries.rootKey, 'detail', brandId] as const,
      queryFn: () =>
        adminBrandsControllerGetById({
          path: { id: brandId },
        }) as Promise<Brand>,
    }),
};

export const brandsMutations = {
  rootKey: brandsQueries.rootKey,
  create: () =>
    mutationOptions({
      mutationKey: [...brandsMutations.rootKey, 'create'] as const,
      mutationFn: (body: CreateBrandDto) => adminBrandsControllerCreate({ body }),
    }),
  update: (brandId: string) =>
    mutationOptions({
      mutationKey: [...brandsMutations.rootKey, 'update', brandId] as const,
      mutationFn: (body: UpdateBrandDto) =>
        adminBrandsControllerUpdate({
          path: { id: brandId },
          body,
        }),
    }),
};
