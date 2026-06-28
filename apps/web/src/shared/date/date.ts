import 'dayjs/locale/en';
import 'dayjs/locale/uk';

import dayjs from 'dayjs';

import type { AppLocale } from '@/i18n/routing';

export const DAYJS_LOCALES: Record<AppLocale, string> = {
  uk: 'uk',
  en: 'en',
};

export { dayjs };
