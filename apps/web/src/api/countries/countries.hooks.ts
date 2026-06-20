'use client';

import { useQuery } from '@tanstack/react-query';

import { useAppLocale } from '@/hooks/locale';

import { formatUseQuery } from '../_lib/queries';
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
