import type { AppLocale } from '@/i18n/routing';
import { dayjs, DAYJS_LOCALES } from '@/shared/date';

export function formatEstimateDeliveryDate(isoDate: string, locale: AppLocale): string {
  const parsed = dayjs(isoDate).locale(DAYJS_LOCALES[locale]);

  if (!parsed.isValid()) {
    return isoDate;
  }

  const formatted = parsed.format('dddd, D MMMM YYYY');

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
