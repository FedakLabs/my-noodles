import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { FeedScreen } from '@/screens/feed';
import type { LocalePageProps } from '@/shared/page-props';
import { buildPageMetadata, NOINDEX_ROBOTS } from '@/shared/seo';

export async function generateMetadata({ params }: Pick<LocalePageProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'feed' });

  return buildPageMetadata({
    locale,
    pathname: '/feed',
    title: t('title'),
    description: t('metaDescription'),
    robots: NOINDEX_ROBOTS,
  });
}

export default async function FeedPage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <FeedScreen />;
}
