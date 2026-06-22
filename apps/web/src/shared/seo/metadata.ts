import type { Metadata } from 'next';

import type { AppLocale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

import { absoluteUrl, buildHreflangAlternates, localePath, openGraphLocale } from './urls';

type OpenGraphType = 'website' | 'article';

type BuildPageMetadataOptions = {
  locale: AppLocale;
  pathname?: string;
  title: string;
  description?: string | null;
  robots?: Metadata['robots'];
  openGraphType?: OpenGraphType;
};

export function buildPageMetadata({
  locale,
  pathname = '/',
  title,
  description,
  robots,
  openGraphType = 'website',
}: BuildPageMetadataOptions): Metadata {
  const canonicalPath = localePath(locale, pathname);
  const alternateLocales = routing.locales.filter((loc) => loc !== locale).map(openGraphLocale);

  return {
    title,
    ...(description ? { description } : {}),
    alternates: {
      canonical: absoluteUrl(canonicalPath),
      languages: buildHreflangAlternates(pathname),
    },
    openGraph: {
      title,
      ...(description ? { description } : {}),
      url: absoluteUrl(canonicalPath),
      type: openGraphType,
      locale: openGraphLocale(locale),
      ...(alternateLocales.length > 0 ? { alternateLocale: alternateLocales } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      ...(description ? { description } : {}),
    },
    ...(robots ? { robots } : {}),
  };
}

export const NOINDEX_ROBOTS: Metadata['robots'] = {
  index: false,
  follow: false,
};
