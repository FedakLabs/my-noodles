import { describe, expect, it } from 'vitest';

import { messageCatalogs, messageNamespaces } from '../../messages';
import { routing } from './routing';

function collectMessageKeys(value: unknown, prefix = ''): string[] {
  if (value === null || typeof value !== 'object') {
    return prefix ? [prefix] : [];
  }

  return Object.entries(value as Record<string, unknown>).flatMap(([key, nested]) => {
    const path = prefix ? `${prefix}.${key}` : key;

    if (nested !== null && typeof nested === 'object' && !Array.isArray(nested)) {
      return collectMessageKeys(nested, path);
    }

    return [path];
  });
}

describe('i18n routing', () => {
  it('keeps uk as the default locale with always-prefixed paths', () => {
    expect(routing.defaultLocale).toBe('uk');
    expect(routing.locales).toEqual(['uk', 'en']);
    expect(routing.localePrefix).toBe('always');
  });
});

describe('message catalogs', () => {
  it('keeps uk and en namespaces aligned for i18n readiness', () => {
    for (const namespace of messageNamespaces) {
      const ukKeys = collectMessageKeys(messageCatalogs.uk[namespace]).sort();
      const enKeys = collectMessageKeys(messageCatalogs.en[namespace]).sort();

      expect(enKeys, `${namespace} key parity`).toEqual(ukKeys);
    }

    expect(messageCatalogs.uk.home.title).toBeTruthy();
    expect(messageCatalogs.en.home.title).toBeTruthy();
  });
});
