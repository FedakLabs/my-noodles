import {
  adminCollectionsControllerCreate,
  adminCollectionsControllerGetById,
  adminCollectionsControllerList,
  adminCollectionsControllerUpdate,
  type Collection,
  type CreateCollectionDto,
  type UpdateCollectionDto,
} from '@my-noodles/api-clients/admin';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

import type { CollectionsListParams } from './types';

export const collectionsQueries = {
  rootKey: ['admin-collections'] as const,
  all: () =>
    queryOptions({
      queryKey: collectionsQueries.rootKey,
    }),
  list: (params: CollectionsListParams) =>
    queryOptions({
      queryKey: [...collectionsQueries.rootKey, 'list', params] as const,
      queryFn: () =>
        adminCollectionsControllerList({
          query: {
            page: params.page,
            limit: params.limit,
            q: params.q,
          },
        }),
    }),
  detail: (collectionId: string) =>
    queryOptions({
      queryKey: [...collectionsQueries.rootKey, 'detail', collectionId] as const,
      queryFn: () =>
        adminCollectionsControllerGetById({
          path: { id: collectionId },
        }) as Promise<Collection>,
    }),
};

export const collectionsMutations = {
  rootKey: collectionsQueries.rootKey,
  create: () =>
    mutationOptions({
      mutationKey: [...collectionsMutations.rootKey, 'create'] as const,
      mutationFn: (body: CreateCollectionDto) => adminCollectionsControllerCreate({ body }),
    }),
  update: (collectionId: string) =>
    mutationOptions({
      mutationKey: [...collectionsMutations.rootKey, 'update', collectionId] as const,
      mutationFn: (body: UpdateCollectionDto) =>
        adminCollectionsControllerUpdate({
          path: { id: collectionId },
          body,
        }),
    }),
};
