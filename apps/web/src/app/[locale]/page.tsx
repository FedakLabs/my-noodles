import { dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { collectionsQueryKeys, fetchCollections } from '@/api/collections';
import { routing } from '@/i18n/routing';
import { HomeScreen } from '@/screens/home';
import type { LocalePageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate } from '@/shared/query-client';
import { buildPageMetadata } from '@/shared/seo';

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'home' });

  return buildPageMetadata({
    locale,
    title: t('title'),
    description: t('description'),
  });
}

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
