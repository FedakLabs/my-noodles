'use client';

import { formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useQuery } from '@tanstack/react-query';

import { useAppLocale } from '@/hooks/locale';

import { collectionsQueryKeys, fetchCollectionDetail, fetchCollections } from './collections';

export function useCollections() {
  const locale = useAppLocale();

  return formatUseQuery(
    useQuery({
      queryKey: collectionsQueryKeys.list(locale),
      queryFn: () => fetchCollections(locale),
    }),
    'collections',
  );
}

export function useCollectionDetail(slug: string) {
  const locale = useAppLocale();

  return formatUseQuery(
    useQuery({
      queryKey: collectionsQueryKeys.detail(slug, locale),
      queryFn: () => fetchCollectionDetail(slug, locale),
      placeholderData: undefined,
    }),
    'collection',
  );
}
