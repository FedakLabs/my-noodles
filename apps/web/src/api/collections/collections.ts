import type {
  ApiLocale,
  CollectionDetailDto,
  CollectionsApiCollectionsControllerGetBySlugRequest,
  CollectionsApiCollectionsControllerListRequest,
  CollectionSummaryDto,
} from '@my-noodles/api-clients/storefront';

import { getApiClients } from '../clients';

export const collectionsQueryKeys = {
  all: ['collections'] as const,
  list: (locale: ApiLocale) => [...collectionsQueryKeys.all, 'list', locale] as const,
  detail: (slug: string, locale: ApiLocale) => [...collectionsQueryKeys.all, 'detail', slug, locale] as const,
};

export async function fetchCollections(locale: ApiLocale): Promise<CollectionSummaryDto[]> {
  const { data } = await getApiClients().collectionsApi.collectionsControllerList({
    locale,
  } as CollectionsApiCollectionsControllerListRequest);

  return data;
}

export async function fetchCollectionDetail(slug: string, locale: ApiLocale): Promise<CollectionDetailDto> {
  const { data } = await getApiClients().collectionsApi.collectionsControllerGetBySlug({
    slug,
    locale,
  } as CollectionsApiCollectionsControllerGetBySlugRequest);

  return data;
}
