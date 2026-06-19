import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { use } from 'react';

import { routing } from '@/i18n/routing';
import { HomeScreen } from '@/screens/home';

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export default function HomePage({ params }: HomePageProps) {
  const { locale } = use(params);

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return <HomeScreen />;
}
