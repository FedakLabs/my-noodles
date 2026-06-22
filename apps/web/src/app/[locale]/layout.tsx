import '@my-noodles/theme/fonts.css';
import '@my-noodles/theme/fonts.local.css';

import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';

import { AnalyticsHead } from '@/components/analytics/analytics-head';
import { ConsentBanner } from '@/components/analytics/consent-banner';
import { AppShell } from '@/components/layout/app-shell';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/shared/env';
import type { LocalePageProps } from '@/shared/page-props';
import {
  buildHreflangAlternates,
  buildOrganizationWebSiteJsonLd,
  JsonLdScript,
  openGraphLocale,
} from '@/shared/seo';

import { Providers } from '../providers';

type LocaleLayoutProps = LocalePageProps & {
  children: React.ReactNode;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Pick<LocaleLayoutProps, 'params'>): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'metadata' });
  const siteName = t('title');
  const alternateLocales = routing.locales.filter((loc) => loc !== locale).map(openGraphLocale);

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description: t('description'),
    alternates: {
      languages: buildHreflangAlternates('/'),
    },
    openGraph: {
      type: 'website',
      siteName,
      title: siteName,
      description: t('description'),
      locale: openGraphLocale(locale),
      ...(alternateLocales.length > 0 ? { alternateLocale: alternateLocales } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: siteName,
      description: t('description'),
    },
  };
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const [messages, t] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: 'metadata' }),
  ]);

  return (
    <html lang={locale}>
      <AnalyticsHead />
      <body>
        <JsonLdScript data={buildOrganizationWebSiteJsonLd(t('title'))} />
        <NextIntlClientProvider messages={messages}>
          <Providers>
            <AppShell>{children}</AppShell>
            <ConsentBanner />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
