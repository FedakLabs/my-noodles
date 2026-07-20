import {
  collectionsControllerGetBySlug,
  collectionsControllerList,
} from '@my-noodles/api-clients/storefront';
import { queryOptions } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

export const collectionsQueries = {
  rootKey: ['collections'] as const,
  /** Locale-prefixed root — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => collectionsQueries.rootKey)(),
    }),
  list: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...collectionsQueries.rootKey, 'list'] as const)(),
      queryFn: () => collectionsControllerList(),
    }),
  detail: (slug: string) =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...collectionsQueries.rootKey, 'detail', slug] as const)(),
      queryFn: () => collectionsControllerGetBySlug({ path: { slug } }),
    }),
};
