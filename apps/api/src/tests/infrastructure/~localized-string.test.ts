import { LocaleContext, LocalizedString, parseRequestLocale } from '@/infrastructure/i18n';

describe('LocalizedString', () => {
  it('resolves value from request locale context', () => {
    const label = new LocalizedString({ uk: 'Привіт', en: 'Hello' });

    LocaleContext.run('uk', () => {
      expect(label.localized).toBe('Привіт');
    });

    LocaleContext.run('en', () => {
      expect(label.localized).toBe('Hello');
    });
  });

  it('returns null when translation is missing for the active locale', () => {
    const label = new LocalizedString({ uk: 'Привіт' });

    LocaleContext.run('en', () => {
      expect(label.localized).toBeNull();
    });
  });
});

describe('LocaleContext', () => {
  it('falls back to the default locale when nothing is bound', () => {
    expect(LocaleContext.get()).toBe('uk');
  });
});

describe('parseRequestLocale', () => {
  it('prefers ?locale over Accept-Language', () => {
    const locale = parseRequestLocale({
      query: { locale: 'en' },
      headers: { 'accept-language': 'uk' },
    } as never);

    expect(locale).toBe('en');
  });

  it('parses Accept-Language when query is absent', () => {
    const locale = parseRequestLocale({
      query: {},
      headers: { 'accept-language': 'en-US,en;q=0.9,uk;q=0.8' },
    } as never);

    expect(locale).toBe('en');
  });
});
