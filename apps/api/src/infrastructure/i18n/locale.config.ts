export const SUPPORTED_LOCALES = ['uk', 'en'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

/** Shared OpenAPI enum schema — `enumName` must match generated client types. */
export const LOCALE_OPENAPI = {
  enum: SUPPORTED_LOCALES,
  enumName: 'Locale',
} as const;

export const DEFAULT_LOCALE: Locale = 'uk';

/** Non-standard Accept-Language tags mapped to a supported locale (e.g. `ua` → `uk`). */
export const LOCALE_ALIASES: Record<string, Locale> = {
  ua: 'uk',
};

export type LocalizedStringData = Partial<Record<Locale, string>> & Record<typeof DEFAULT_LOCALE, string>;

export type LocalizedStringRecord = Partial<Record<Locale, string>>;
