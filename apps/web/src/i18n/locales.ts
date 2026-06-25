import { type AppLocale, routing } from './routing';

export type LocaleOption = {
  value: AppLocale;
  label: string;
};

/** Native endonyms — not passed through useTranslations. */
const LOCALE_LABELS: Record<AppLocale, string> = {
  uk: 'Українська',
  en: 'English',
};

export const LOCALE_OPTIONS: ReadonlyArray<LocaleOption> = routing.locales.map((value) => ({
  value,
  label: LOCALE_LABELS[value],
}));

export function getLocaleLabel(locale: AppLocale): string {
  return LOCALE_LABELS[locale] ?? locale;
}
