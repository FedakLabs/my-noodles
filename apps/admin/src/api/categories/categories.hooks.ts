import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { categoriesMutations, categoriesQueries } from './categories';
import type { CategoriesListParams } from './types';

async function invalidateCategoriesTree(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: categoriesQueries.all().queryKey });
}

export function useCategoriesList(params: CategoriesListParams) {
  return formatUseQuery(useQuery(categoriesQueries.list(params)), 'categories');
}

export function useCategory(categoryId: string) {
  return formatUseQuery(
    useQuery({
      ...categoriesQueries.detail(categoryId),
      enabled: Boolean(categoryId),
    }),
    'category',
  );
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...categoriesMutations.create(),
      onSuccess: async () => {
        await invalidateCategoriesTree(queryClient);
      },
    }),
    'createCategory',
  );
}

export function useUpdateCategory(categoryId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...categoriesMutations.update(categoryId),
      onSuccess: async () => {
        await invalidateCategoriesTree(queryClient);
      },
    }),
    'updateCategory',
  );
}
