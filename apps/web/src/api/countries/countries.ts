import { countriesControllerList, type CountryDto, type Locale } from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';

export const countriesQueryKeys = {
  all: ['countries'] as const,
  list: (locale: Locale) => [...countriesQueryKeys.all, 'list', locale] as const,
};

export async function fetchCountries(locale: Locale): Promise<CountryDto[]> {
  return requestData(countriesControllerList({ query: { locale } }));
}
