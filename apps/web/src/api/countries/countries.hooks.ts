'use client';

import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { countriesQueryKeys, fetchCountries } from './countries';

export function useCountries() {
  return formatUseQuery(
    useQuery({
      queryKey: countriesQueryKeys.list(),
      queryFn: () => fetchCountries(),
    }),
    'countries',
  );
}
