import {
  type CollectionDetailDto,
  collectionsControllerGetBySlug,
  collectionsControllerList,
  type CollectionSummaryDto,
} from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

const collectionsQueryKeyRoot = ['collections'] as const;

export const collectionsQueryKeys = {
  all: collectionsQueryKeyRoot,
  list: withAppLocaleKey(() => [...collectionsQueryKeyRoot, 'list'] as const),
  detail: withAppLocaleKey((slug: string) => [...collectionsQueryKeyRoot, 'detail', slug] as const),
};

export async function fetchCollections(): Promise<CollectionSummaryDto[]> {
  return requestData(collectionsControllerList());
}

export async function fetchCollectionDetail(slug: string): Promise<CollectionDetailDto> {
  return requestData(
    collectionsControllerGetBySlug({
      path: { slug },
    }),
  );
}
