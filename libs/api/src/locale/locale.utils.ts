import type { Request } from 'express';

import {
  APP_LOCALE_HEADER,
  DEFAULT_LOCALE,
  type Locale,
  LOCALE_ALIASES,
  SUPPORTED_LOCALES,
} from './locale.config';

function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

function resolveLocaleFromLanguageTag(tag: string): Locale | undefined {
  const normalized = tag.toLowerCase();
  const primary = normalized.split('-')[0] ?? normalized;

  for (const candidate of [normalized, primary]) {
    if (isSupportedLocale(candidate)) {
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

function parseAcceptLanguage(header: string): Locale | undefined {
  const candidates = header
    .split(',')
    .map((part) => {
      const [rawLang, ...params] = part.trim().split(';');
      const lang = rawLang?.toLowerCase() ?? '';
      const qParam = params.find((param) => param.trim().startsWith('q='));
      const q = qParam ? Number.parseFloat(qParam.trim().slice(2)) : 1;

      return { lang, q: Number.isFinite(q) ? q : 0 };
    })
    .sort((left, right) => right.q - left.q);

  for (const { lang } of candidates) {
    const locale = resolveLocaleFromLanguageTag(lang);
    if (locale) {
      return locale;
    }
  }

  return undefined;
}

function parseAppLocaleHeader(value: string | string[] | undefined): Locale | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== 'string' || raw.length === 0) {
    return undefined;
  }

  return resolveLocaleFromLanguageTag(raw);
}

export function parseRequestLocale(req: Request): Locale {
  const fromHeader = parseAppLocaleHeader(req.headers[APP_LOCALE_HEADER]);
  if (fromHeader) {
    return fromHeader;
  }

  const acceptLanguage = req.headers['accept-language'];
  if (typeof acceptLanguage === 'string') {
    const fromHeader = parseAcceptLanguage(acceptLanguage);
    if (fromHeader) {
      return fromHeader;
    }
  }

  return DEFAULT_LOCALE;
}
