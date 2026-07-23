import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { countriesMutations, countriesQueries } from './countries';
import type { CountriesListParams } from './types';

async function invalidateCountriesTree(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: countriesQueries.all().queryKey });
}

export function useCountriesList(params: CountriesListParams) {
  return formatUseQuery(useQuery(countriesQueries.list(params)), 'countries');
}

export function useCountry(countryId: string) {
  return formatUseQuery(
    useQuery({
      ...countriesQueries.detail(countryId),
      enabled: Boolean(countryId),
    }),
    'country',
  );
}

export function useCreateCountry() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...countriesMutations.create(),
      onSuccess: async () => {
        await invalidateCountriesTree(queryClient);
      },
    }),
    'createCountry',
  );
}

export function useUpdateCountry(countryId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...countriesMutations.update(countryId),
      onSuccess: async () => {
        await invalidateCountriesTree(queryClient);
      },
    }),
    'updateCountry',
  );
}
