import { resolveLocaleFromLanguageTag } from '@my-noodles/locale';
import type { Request } from 'express';

import { APP_LOCALE_HEADER, DEFAULT_LOCALE, type Locale } from './locale.config';

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
    const fromAccept = parseAcceptLanguage(acceptLanguage);
    if (fromAccept) {
      return fromAccept;
    }
  }

  return DEFAULT_LOCALE;
}
