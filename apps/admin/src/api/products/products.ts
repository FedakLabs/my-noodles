import {
  adminProductsControllerCreate,
  adminProductsControllerGetById,
  adminProductsControllerList,
  adminProductsControllerUpdate,
  type AdminProductDto,
  type CreateProductDto,
  type UpdateProductDto,
} from '@my-noodles/api-clients/admin';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

export type ProductsListParams = {
  page: number;
  limit: number;
  slug?: string;
  name?: string;
  categoryId?: string[];
  brandId?: string[];
  countryId?: string[];
};

export const productsQueries = {
  rootKey: ['products'] as const,
  /** Root key — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: productsQueries.rootKey,
    }),
  list: (params: ProductsListParams) =>
    queryOptions({
      queryKey: [...productsQueries.rootKey, 'list', params] as const,
      queryFn: () =>
        adminProductsControllerList({
          query: {
            page: params.page,
            limit: params.limit,
            slug: params.slug,
            name: params.name,
            categoryId: params.categoryId,
            brandId: params.brandId,
            countryId: params.countryId,
          },
        }),
    }),
  detail: (productId: string) =>
    queryOptions({
      queryKey: [...productsQueries.rootKey, 'detail', productId] as const,
      queryFn: () =>
        adminProductsControllerGetById({
          path: { id: productId },
        }) as Promise<AdminProductDto>,
    }),
};

export const productsMutations = {
  rootKey: productsQueries.rootKey,
  create: () =>
    mutationOptions({
      mutationKey: [...productsMutations.rootKey, 'create'] as const,
      mutationFn: (body: CreateProductDto) => adminProductsControllerCreate({ body }),
    }),
  update: (productId: string) =>
    mutationOptions({
      mutationKey: [...productsMutations.rootKey, 'update', productId] as const,
      mutationFn: (body: UpdateProductDto) =>
        adminProductsControllerUpdate({
          path: { id: productId },
          body,
        }),
    }),
};
