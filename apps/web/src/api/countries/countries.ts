import { countriesControllerList } from '@my-noodles/api-clients/storefront';
import { queryOptions } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

export const countriesQueries = {
  rootKey: ['countries'] as const,
  /** Locale-prefixed root — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => countriesQueries.rootKey)(),
    }),
  list: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...countriesQueries.rootKey, 'list'] as const)(),
      queryFn: () => countriesControllerList(),
    }),
};
