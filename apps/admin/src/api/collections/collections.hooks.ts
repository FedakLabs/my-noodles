import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { collectionsMutations, collectionsQueries } from './collections';
import type { CollectionsListParams } from './types';

async function invalidateCollectionsTree(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: collectionsQueries.all().queryKey });
}

export function useCollectionsList(params: CollectionsListParams) {
  return formatUseQuery(useQuery(collectionsQueries.list(params)), 'collections');
}

export function useCollection(collectionId: string) {
  return formatUseQuery(
    useQuery({
      ...collectionsQueries.detail(collectionId),
      enabled: Boolean(collectionId),
    }),
    'collection',
  );
}

export function useCreateCollection() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...collectionsMutations.create(),
      onSuccess: async () => {
        await invalidateCollectionsTree(queryClient);
      },
    }),
    'createCollection',
  );
}

export function useUpdateCollection(collectionId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...collectionsMutations.update(collectionId),
      onSuccess: async () => {
        await invalidateCollectionsTree(queryClient);
      },
    }),
    'updateCollection',
  );
}
