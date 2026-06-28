import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { CheckoutScreen } from '@/screens/checkout';
import type { LocalePageProps } from '@/shared/page-props';
import { buildPageMetadata, NOINDEX_ROBOTS } from '@/shared/seo';

type CheckoutPageProps = LocalePageProps & {
  params: Promise<{ locale: string; checkoutId: string }>;
};

export async function generateMetadata({ params }: CheckoutPageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'checkout' });

  return buildPageMetadata({
    locale,
    pathname: '/checkout',
    title: t('title'),
    robots: NOINDEX_ROBOTS,
  });
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { locale, checkoutId } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <CheckoutScreen checkoutId={checkoutId} />;
}
