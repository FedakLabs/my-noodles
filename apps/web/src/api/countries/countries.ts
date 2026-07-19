import { countriesControllerList, type Country } from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';
import { queryOptions } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

const countriesQueryKeyRoot = ['countries'] as const;

export const countriesQueryKeys = {
  all: countriesQueryKeyRoot,
  list: withAppLocaleKey(() => [...countriesQueryKeyRoot, 'list'] as const),
};

export async function fetchCountries(): Promise<Country[]> {
  return await requestData(countriesControllerList());
}

export const countriesQueries = {
  list: () =>
    queryOptions({
      queryKey: countriesQueryKeys.list(),
      queryFn: () => fetchCountries(),
    }),
};
