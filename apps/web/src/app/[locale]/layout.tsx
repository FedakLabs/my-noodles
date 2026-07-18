import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';

import { AnalyticsHead } from '@/components/analytics/analytics-head';
import { ConsentBanner } from '@/components/analytics/consent-banner';
import { AppShell } from '@/components/layout/app-shell';
import { withPageLocale, withPageLocaleMetadata, type WithPageLocaleProps } from '@/i18n/app-locale/server';
import { routing } from '@/i18n/routing';
import { env } from '@/shared/env';
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

export const generateMetadata = withPageLocaleMetadata<LocalePageProps>(async ({ locale }) => {
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const siteName = t('title');
  const alternateLocales = routing.locales.filter((loc) => loc !== locale).map(openGraphLocale);

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
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
    icons: {
      icon: '/brand/mynoodles-logo.svg',
      apple: '/brand/mynoodles-logo.svg',
    },
  };
});

async function LocaleLayout({ children, locale }: WithPageLocaleProps<LocaleLayoutProps>) {
  const [messages, t] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: 'metadata' }),
  ]);

  return (
    <>
      <AnalyticsHead />
      <JsonLdScript data={buildOrganizationWebSiteJsonLd(t('title'))} />
      <NextIntlClientProvider messages={messages}>
        <Providers locale={locale}>
          <AppShell>{children}</AppShell>
          <ConsentBanner />
        </Providers>
      </NextIntlClientProvider>
    </>
  );
}

export default withPageLocale(LocaleLayout);
