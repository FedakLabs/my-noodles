import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { brandsMutations, brandsQueries } from './brands';
import type { BrandsListParams } from './types';

async function invalidateBrandsTree(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: brandsQueries.all().queryKey });
}

export function useBrandsList(params: BrandsListParams) {
  return formatUseQuery(useQuery(brandsQueries.list(params)), 'brands');
}

export function useBrand(brandId: string) {
  return formatUseQuery(
    useQuery({
      ...brandsQueries.detail(brandId),
      enabled: Boolean(brandId),
    }),
    'brand',
  );
}

export function useCreateBrand() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...brandsMutations.create(),
      onSuccess: async () => {
        await invalidateBrandsTree(queryClient);
      },
    }),
    'createBrand',
  );
}

export function useUpdateBrand(brandId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...brandsMutations.update(brandId),
      onSuccess: async () => {
        await invalidateBrandsTree(queryClient);
      },
    }),
    'updateBrand',
  );
}
