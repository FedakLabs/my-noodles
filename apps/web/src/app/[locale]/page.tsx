import { dehydrate } from '@tanstack/react-query';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { collectionsQueryKeys, fetchCollections } from '@/api/collections';
import { runWithAppLocale } from '@/i18n/app-locale/server';
import { routing } from '@/i18n/routing';
import { HomeScreen } from '@/screens/home';
import type { LocalePageProps } from '@/shared/page-props';
import { getQueryClient, QueryHydrate, runPrefetchSafe } from '@/shared/query-client';
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

  return runWithAppLocale(locale, async () => {
    const queryClient = getQueryClient();

    await runPrefetchSafe(() =>
      queryClient.prefetchQuery({
        queryKey: collectionsQueryKeys.list(),
        queryFn: () => fetchCollections(),
      }),
    );

    return (
      <QueryHydrate state={dehydrate(queryClient)}>
        <HomeScreen />
      </QueryHydrate>
    );
  });
}
