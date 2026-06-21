import { dehydrate } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { collectionsQueryKeys, fetchCollections } from '@/api/collections';
import { routing } from '@/i18n/routing';
import { HomeScreen } from '@/screens/home';
import { ISR_REVALIDATE_SECONDS } from '@/shared/isr';
import type { LocalePageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate } from '@/shared/query-client';

export const revalidate = ISR_REVALIDATE_SECONDS;

export default async function HomePage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: collectionsQueryKeys.list(locale),
    queryFn: () => fetchCollections(locale),
  });

  return (
    <QueryHydrate state={dehydrate(queryClient)}>
      <HomeScreen />
    </QueryHydrate>
  );
}
