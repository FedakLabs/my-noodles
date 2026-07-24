import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { sellersMutations, sellersQueries } from './sellers';
import type { SellersListParams } from './types';

async function invalidateSellersTree(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: sellersQueries.all().queryKey });
}

export function useSellersList(params: SellersListParams) {
  return formatUseQuery(useQuery(sellersQueries.list(params)), 'sellers');
}

export function useSeller(sellerId: string) {
  return formatUseQuery(
    useQuery({
      ...sellersQueries.detail(sellerId),
      enabled: Boolean(sellerId),
    }),
    'seller',
  );
}

export function useCreateSeller() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...sellersMutations.create(),
      onSuccess: async () => {
        await invalidateSellersTree(queryClient);
      },
    }),
    'createSeller',
  );
}

export function useUpdateSeller(sellerId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...sellersMutations.update(sellerId),
      onSuccess: async () => {
        await invalidateSellersTree(queryClient);
      },
    }),
    'updateSeller',
  );
}
