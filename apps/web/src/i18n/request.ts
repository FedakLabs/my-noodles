import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';

import type ukMessages from '../../messages/uk.json';
import { type AppLocale, routing } from './routing';

const messageLoaders = {
  uk: () => import('../../messages/uk.json'),
  en: () => import('../../messages/en.json'),
} as const satisfies Record<AppLocale, () => Promise<{ default: typeof ukMessages }>>;

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;

  return {
    locale,
    messages: (await messageLoaders[locale]()).default,
  };
});
