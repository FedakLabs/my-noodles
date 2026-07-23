import { DEFAULT_LOCALE, SUPPORTED_LOCALES, type Locale } from '@my-noodles/locale';
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',
});

export type AppLocale = Locale;
