import {
  type CollectionDetailDto,
  collectionsControllerGetBySlug,
  collectionsControllerList,
  type CollectionSummaryDto,
  type Locale,
} from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';

export const collectionsQueryKeys = {
  all: ['collections'] as const,
  list: (locale: Locale) => [...collectionsQueryKeys.all, 'list', locale] as const,
  detail: (slug: string, locale: Locale) => [...collectionsQueryKeys.all, 'detail', slug, locale] as const,
};

export async function fetchCollections(locale: Locale): Promise<CollectionSummaryDto[]> {
  return requestData(collectionsControllerList({ query: { locale } }));
}

export async function fetchCollectionDetail(slug: string, locale: Locale): Promise<CollectionDetailDto> {
  return requestData(
    collectionsControllerGetBySlug({
      path: { slug },
      query: { locale },
    }),
  );
}
