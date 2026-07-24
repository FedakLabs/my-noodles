import { DEFAULT_LOCALE, type Locale } from '@my-noodles/locale';
import dayjs from 'dayjs';
import 'dayjs/locale/en';
import 'dayjs/locale/uk';
import { enUS, uk, type Locale as DayPickerLocale } from 'react-day-picker/locale';

const dayPickerLocaleMap: Record<Locale, DayPickerLocale> = {
  en: enUS,
  uk,
};

export function getDayPickerLocale(locale: Locale = DEFAULT_LOCALE): DayPickerLocale {
  return dayPickerLocaleMap[locale] ?? dayPickerLocaleMap[DEFAULT_LOCALE];
}

export function formatMonthCaption(date: Date, locale: Locale = DEFAULT_LOCALE): string {
  return dayjs(date).locale(locale).format('MMMM YYYY');
}
