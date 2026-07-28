export const SUPPORTED_LOCALES = ['uk', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'uk';

/** Non-standard Accept-Language tags mapped to a supported locale (e.g. `ua` → `uk`). */
export const LOCALE_ALIASES: Record<string, Locale> = {
  ua: 'uk',
};

export type LocalizedStringRecord = Partial<Record<Locale, string>>;

/** Admin write / form payload — every supported locale required. */
export type RequiredLocalizedString = Record<Locale, string>;

/** Stored / on-the-wire locale map — every supported locale is always present. */
export type LocalizedStringData = RequiredLocalizedString;

export const APP_LOCALE_HEADER = 'x-app-locale';

/** Native endonyms — not for i18n message catalogs. */
export const LOCALE_LABELS: Record<Locale, string> = {
  uk: 'Українська',
  en: 'English',
};

/** Open Graph `og:locale` / alternate locale tags. */
export const OPEN_GRAPH_LOCALES: Record<Locale, string> = {
  uk: 'uk_UA',
  en: 'en_US',
};

export type LocaleOption = {
  value: Locale;
  label: string;
};

export const LOCALE_OPTIONS: readonly LocaleOption[] = SUPPORTED_LOCALES.map((value) => ({
  value,
  label: LOCALE_LABELS[value],
}));

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function getLocaleLabel(locale: Locale): string {
  return LOCALE_LABELS[locale] ?? locale;
}

export function toOpenGraphLocale(locale: Locale): string {
  return OPEN_GRAPH_LOCALES[locale];
}

/**
 * Resolve a BCP-47 / Accept-Language primary tag (or alias like `ua`) to a supported locale.
 * Returns `undefined` when nothing matches.
 */
export function resolveLocaleFromLanguageTag(tag: string): Locale | undefined {
  const normalized = tag.toLowerCase();
  const primary = normalized.split('-')[0] ?? normalized;

  for (const candidate of [normalized, primary]) {
    if (isLocale(candidate)) {
      return candidate;
    }

    const aliased = LOCALE_ALIASES[candidate];
    if (aliased) {
      return aliased;
    }
  }

  const localesByLongestFirst = [...SUPPORTED_LOCALES].sort((left, right) => right.length - left.length);

  for (const locale of localesByLongestFirst) {
    if (normalized.startsWith(locale)) {
      return locale;
    }
  }

  return undefined;
}

export function resolveLocale(tag: string, fallback: Locale = DEFAULT_LOCALE): Locale {
  return resolveLocaleFromLanguageTag(tag) ?? fallback;
}

/**
 * Compile-time check that `T` has exactly the same keys as `SUPPORTED_LOCALES`.
 * Call once at module scope: `assertLocalesMatch<LocalizedStringDto>(true)`.
 */
export type AssertLocalesMatch<T> = [Exclude<Locale, keyof T>, Exclude<keyof T, Locale>] extends [
  never,
  never,
]
  ? true
  : never;

export function assertLocalesMatch<T>(_proof: AssertLocalesMatch<T>): void {}

export function emptyLocalizedString(): RequiredLocalizedString {
  return Object.fromEntries(SUPPORTED_LOCALES.map((locale) => [locale, ''])) as RequiredLocalizedString;
}

/** Normalize a partial locale map so every supported locale is a string. */
export function toRequiredLocalizedString(value: LocalizedStringRecord): RequiredLocalizedString {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, value[locale] ?? '']),
  ) as RequiredLocalizedString;
}

export function cleanLocalizedString(value: RequiredLocalizedString): RequiredLocalizedString {
  return Object.fromEntries(
    SUPPORTED_LOCALES.map((locale) => [locale, value[locale].trim()]),
  ) as RequiredLocalizedString;
}

export function isLocalizedStringComplete(value: RequiredLocalizedString): boolean {
  return SUPPORTED_LOCALES.every((locale) => value[locale].trim().length > 0);
}

/** Pick a locale string for display; falls back to `DEFAULT_LOCALE` when missing. */
export function pickLocalized(value: LocalizedStringRecord, locale: Locale): string {
  return value[locale]?.trim() || value[DEFAULT_LOCALE] || '';
}
