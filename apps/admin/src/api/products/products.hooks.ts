import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { productsMutations, productsQueries } from './products';
import type { ProductsListParams } from './types';

async function invalidateProductsTree(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: productsQueries.all().queryKey });
}

export function useProductsList(params: ProductsListParams) {
  return formatUseQuery(useQuery(productsQueries.list(params)), 'products');
}

export function useProduct(productId: string) {
  return formatUseQuery(
    useQuery({
      ...productsQueries.detail(productId),
      enabled: Boolean(productId),
    }),
    'product',
  );
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...productsMutations.create(),
      onSuccess: async () => {
        await invalidateProductsTree(queryClient);
      },
    }),
    'createProduct',
  );
}

export function useUpdateProduct(productId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...productsMutations.update(productId),
      onSuccess: async () => {
        await invalidateProductsTree(queryClient);
      },
    }),
    'updateProduct',
  );
}
