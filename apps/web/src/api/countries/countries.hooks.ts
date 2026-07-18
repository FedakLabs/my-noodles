'use client';

import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { countriesQueries } from './countries';

export function useCountries() {
  return formatUseQuery(useQuery(countriesQueries.list()), 'countries');
}
