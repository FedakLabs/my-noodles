import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { CheckoutSuccessScreen } from '@/screens/checkout-success';
import type { LocalePageProps } from '@/shared/page-props';
import { buildPageMetadata, NOINDEX_ROBOTS } from '@/shared/seo';

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'checkout.success' });

  return buildPageMetadata({
    locale,
    pathname: '/checkout/success',
    title: t('title'),
    description: t('description'),
    robots: NOINDEX_ROBOTS,
  });
}

export default async function CheckoutSuccessPage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <CheckoutSuccessScreen />;
}
