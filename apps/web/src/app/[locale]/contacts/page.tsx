import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { routing } from '@/i18n/routing';
import { ContactsScreen } from '@/screens/contacts';
import type { LocalePageProps } from '@/shared/page-props';
import { buildPageMetadata } from '@/shared/seo';

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  const t = await getTranslations({ locale, namespace: 'contacts' });

  return buildPageMetadata({
    locale,
    pathname: '/contacts',
    title: t('title'),
    description: t('description'),
  });
}

export default async function ContactsPage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <ContactsScreen />;
}
