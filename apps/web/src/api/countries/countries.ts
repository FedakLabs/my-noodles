import type {
  ApiLocale,
  CountriesApiCountriesControllerListRequest,
  CountryDto,
} from '@my-noodles/api-clients/storefront';

import { getApiClients } from '../clients';

export const countriesQueryKeys = {
  all: ['countries'] as const,
  list: (locale: ApiLocale) => [...countriesQueryKeys.all, 'list', locale] as const,
};

export async function fetchCountries(locale: ApiLocale): Promise<CountryDto[]> {
  const { data } = await getApiClients().countriesApi.countriesControllerList({
    locale,
  } as CountriesApiCountriesControllerListRequest);

  return data;
}
