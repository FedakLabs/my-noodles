import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useLocaleStore } from './locale-store';

describe('useLocaleStore.switchLocale', () => {
  const assignMock = vi.fn();

  beforeEach(() => {
    useLocaleStore.setState({ locale: 'uk' });
    vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    assignMock.mockReset();
    vi.unstubAllGlobals();
  });

  it('assigns a full locale-prefixed URL with preserved search params', () => {
    vi.stubGlobal('location', {
      assign: assignMock,
      pathname: '/uk/catalog',
      search: '?category=snacks',
    } satisfies Pick<Location, 'assign' | 'pathname' | 'search'>);

    useLocaleStore.getState().switchLocale('en');

    expect(assignMock).toHaveBeenCalledWith('/en/catalog?category=snacks');
  });

  it('skips navigation when locale is unchanged', () => {
    vi.stubGlobal('location', {
      assign: assignMock,
      pathname: '/uk/catalog',
      search: '',
    } satisfies Pick<Location, 'assign' | 'pathname' | 'search'>);

    useLocaleStore.getState().switchLocale('uk');

    expect(assignMock).not.toHaveBeenCalled();
  });
});
