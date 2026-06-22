import type { AppLocale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';
import { SITE_URL } from '@/shared/env';

export function localePath(locale: AppLocale, pathname = '/'): string {
  const normalized = pathname.startsWith('/') ? pathname : `/${pathname}`;

  if (normalized === '/') {
    return `/${locale}`;
  }

  return `/${locale}${normalized}`;
}

export function absoluteUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;

  return `${SITE_URL}${normalized}`;
}

export function buildHreflangAlternates(pathname = '/'): Record<string, string> {
  const languages = Object.fromEntries(
    routing.locales.map((locale) => [locale, absoluteUrl(localePath(locale, pathname))]),
  ) as Record<string, string>;

  languages['x-default'] = absoluteUrl(localePath(routing.defaultLocale, pathname));

  return languages;
}

export function openGraphLocale(locale: AppLocale): string {
  return locale === 'uk' ? 'uk_UA' : 'en_US';
}
