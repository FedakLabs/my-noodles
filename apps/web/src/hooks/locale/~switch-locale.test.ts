import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocaleStore } from './locale-store';
import { buildLocalizedHref, switchAppLocale } from './switch-locale';

describe('buildLocalizedHref', () => {
  it('appends search params when present', () => {
    expect(buildLocalizedHref('/catalog', new URLSearchParams('category=snacks'))).toBe(
      '/catalog?category=snacks',
    );
  });

  it('returns pathname only when search params are empty', () => {
    expect(buildLocalizedHref('/catalog', new URLSearchParams())).toBe('/catalog');
  });
});

describe('switchAppLocale', () => {
  const replaceMock = vi.fn();

  beforeEach(() => {
    replaceMock.mockReset();
    useLocaleStore.setState({ locale: 'uk' });
  });

  it('updates store and navigates with preserved search params', () => {
    switchAppLocale(
      'en',
      'uk',
      '/catalog',
      new URLSearchParams('category=snacks'),
      { replace: replaceMock },
      (locale) => useLocaleStore.setState({ locale }),
    );

    expect(useLocaleStore.getState().locale).toBe('en');
    expect(replaceMock).toHaveBeenCalledWith('/catalog?category=snacks', { locale: 'en' });
  });

  it('skips navigation when locale is unchanged', () => {
    switchAppLocale(
      'uk',
      'uk',
      '/catalog',
      new URLSearchParams('category=snacks'),
      { replace: replaceMock },
      (locale) => useLocaleStore.setState({ locale }),
    );

    expect(replaceMock).not.toHaveBeenCalled();
  });
});
