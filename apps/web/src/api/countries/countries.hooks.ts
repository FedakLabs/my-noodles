'use client';

import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { useAppLocale } from '@/hooks/locale';

import { countriesQueryKeys, fetchCountries } from './countries';

export function useCountries() {
  const locale = useAppLocale();

  return formatUseQuery(
    useQuery({
      queryKey: countriesQueryKeys.list(locale),
      queryFn: () => fetchCountries(locale),
    }),
    'countries',
  );
}
