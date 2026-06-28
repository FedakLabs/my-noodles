import type { AppLocale } from '@/i18n/routing';
import { dayjs, DAYJS_LOCALES } from '@/shared/date';

/** Weekday, day, full month name, and year (e.g. «Середа, 15 липня 2026»). */
export function formatEstimateDeliveryDate(isoDate: string, locale: AppLocale): string {
  const parsed = dayjs(isoDate).locale(DAYJS_LOCALES[locale]);

  if (!parsed.isValid()) {
    return isoDate;
  }

  const formatted = parsed.format('dddd, D MMMM YYYY');

  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}
