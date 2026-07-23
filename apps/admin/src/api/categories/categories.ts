import {
  adminCategoriesControllerCreate,
  adminCategoriesControllerGetById,
  adminCategoriesControllerList,
  adminCategoriesControllerUpdate,
  type AdminCategoryDto,
  type CreateCategoryDto,
  type UpdateCategoryDto,
} from '@my-noodles/api-clients/admin';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

export type CategoriesListParams = {
  page: number;
  limit: number;
  q?: string;
};

export const categoriesQueries = {
  rootKey: ['categories'] as const,
  /** Root key — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: categoriesQueries.rootKey,
    }),
  list: (params: CategoriesListParams) =>
    queryOptions({
      queryKey: [...categoriesQueries.rootKey, 'list', params] as const,
      queryFn: () =>
        adminCategoriesControllerList({
          query: {
            page: params.page,
            limit: params.limit,
            q: params.q,
          },
        }),
    }),
  detail: (categoryId: string) =>
    queryOptions({
      queryKey: [...categoriesQueries.rootKey, 'detail', categoryId] as const,
      queryFn: () =>
        adminCategoriesControllerGetById({
          path: { id: categoryId },
        }) as Promise<AdminCategoryDto>,
    }),
};

export const categoriesMutations = {
  rootKey: categoriesQueries.rootKey,
  create: () =>
    mutationOptions({
      mutationKey: [...categoriesMutations.rootKey, 'create'] as const,
      mutationFn: (body: CreateCategoryDto) => adminCategoriesControllerCreate({ body }),
    }),
  update: (categoryId: string) =>
    mutationOptions({
      mutationKey: [...categoriesMutations.rootKey, 'update', categoryId] as const,
      mutationFn: (body: UpdateCategoryDto) =>
        adminCategoriesControllerUpdate({
          path: { id: categoryId },
          body,
        }),
    }),
};
