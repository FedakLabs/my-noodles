import { describe, expect, it } from 'vitest';

import enMessages from '../../messages/en.json';
import ukMessages from '../../messages/uk.json';
import { routing } from './routing';

describe('i18n routing', () => {
  it('keeps uk as the default locale with always-prefixed paths', () => {
    expect(routing.defaultLocale).toBe('uk');
    expect(routing.locales).toEqual(['uk', 'en']);
    expect(routing.localePrefix).toBe('always');
  });
});

describe('message catalogs', () => {
  it('keeps uk and en namespaces aligned for i18n readiness', () => {
    expect(Object.keys(ukMessages).sort()).toEqual(Object.keys(enMessages).sort());
    expect(ukMessages.home.title).toBeTruthy();
    expect(enMessages.home.title).toBeTruthy();
  });
});
