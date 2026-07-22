import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LANDING_COOKIE, LANDING_QUERY_PARAM } from './config';

function createRequest({ searchParams, cookie }: { searchParams?: Record<string, string>; cookie?: string }) {
  const url = new URL('https://example.com/uk');
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
  }

  return {
    nextUrl: url,
    cookies: {
      get: (name: string) => {
        if (name === LANDING_COOKIE && cookie != null) {
          return { name, value: cookie };
        }
        return undefined;
      },
    },
  } as never;
}

describe('resolveAssignment', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  async function loadResolveAssignment() {
    const mod = await import('./assign');
    return mod.resolveAssignment;
  }

  it('prefers a valid query override and pins that variant', async () => {
    vi.stubEnv('LANDING_VARIANT', 'c');
    const resolveAssignment = await loadResolveAssignment();
    const result = resolveAssignment(
      createRequest({ searchParams: { [LANDING_QUERY_PARAM]: 'b' }, cookie: 'a' }),
    );
    expect(result).toEqual({ variant: 'b', source: 'query' });
  });

  it('uses LANDING_VARIANT env over cookie when no query override', async () => {
    vi.stubEnv('LANDING_VARIANT', 'b');
    const resolveAssignment = await loadResolveAssignment();
    const result = resolveAssignment(createRequest({ cookie: 'a' }));
    expect(result).toEqual({ variant: 'b', source: 'env' });
  });

  it('ignores an invalid LANDING_VARIANT at parse time', async () => {
    vi.stubEnv('LANDING_VARIANT', 'nope');
    await expect(loadResolveAssignment()).rejects.toThrow();
  });

  it('uses the cookie when no query or env override is present', async () => {
    const resolveAssignment = await loadResolveAssignment();
    const result = resolveAssignment(createRequest({ cookie: 'a' }));
    expect(result).toEqual({ variant: 'a', source: 'cookie' });
  });

  it('ignores an invalid cookie and assigns randomly', async () => {
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      const bytes = array as Uint8Array;
      bytes[0] = 1;
      return array;
    });

    const resolveAssignment = await loadResolveAssignment();
    const result = resolveAssignment(createRequest({ cookie: 'nope' }));
    expect(result).toEqual({ variant: 'b', source: 'assigned' });
  });

  it('assigns a random variant when nothing is set', async () => {
    vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
      const bytes = array as Uint8Array;
      bytes[0] = 2;
      return array;
    });

    const resolveAssignment = await loadResolveAssignment();
    const result = resolveAssignment(createRequest({}));
    expect(result).toEqual({ variant: 'c', source: 'assigned' });
  });
});
