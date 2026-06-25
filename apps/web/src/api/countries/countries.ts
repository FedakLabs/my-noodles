import { countriesControllerList, type CountryDto } from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';

import { withAppLocaleKey } from '@/shared/app-locale';

const countriesQueryKeyRoot = ['countries'] as const;

export const countriesQueryKeys = {
  all: countriesQueryKeyRoot,
  list: withAppLocaleKey(() => [...countriesQueryKeyRoot, 'list'] as const),
};

export async function fetchCountries(): Promise<CountryDto[]> {
  return requestData(countriesControllerList());
}
