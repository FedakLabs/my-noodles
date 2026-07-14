import 'server-only';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';

import type { AppLocale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

import { runWithAppLocale } from './server-context';

export async function withPageLocale<T>(
  params: Promise<{ locale: string }>,
  fn: (locale: AppLocale) => Promise<T>,
): Promise<T> {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return runWithAppLocale(locale, () => fn(locale));
}
