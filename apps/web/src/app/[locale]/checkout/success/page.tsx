import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { CheckoutSuccessScreen } from '@/screens/checkout-success';
import type { LocalePageProps } from '@/shared/page-props';

export default async function CheckoutSuccessPage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <CheckoutSuccessScreen />;
}
