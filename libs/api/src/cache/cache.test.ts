import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { Cache, createCache, resetCacheRegistry } from './cache';
import { InMemoryCacheStore } from './in-memory-cache';

describe('InMemoryCacheStore', () => {
  it('stores and returns values before TTL expires', async () => {
    const store = new InMemoryCacheStore();

    await store.set('k', 'v', 60);
    await expect(store.get('k')).resolves.toBe('v');
  });

  it('returns null after TTL expires', async () => {
    jest.useFakeTimers();
    const store = new InMemoryCacheStore();

    await store.set('k', 'v', 1);
    jest.advanceTimersByTime(1001);

    await expect(store.get('k')).resolves.toBeNull();
    jest.useRealTimers();
  });
});

describe('Cache', () => {
  afterEach(() => {
    resetCacheRegistry();
  });

  it('fetches once and serves subsequent reads from the store', async () => {
    const fetcher = jest.fn(async () => ({ value: 1 }));
    const cache = new Cache({
      name: 'unit.example',
      ttlSeconds: 60,
      store: new InMemoryCacheStore(),
      fetcher,
    });

    await expect(cache.get()).resolves.toEqual({ value: 1 });
    await expect(cache.get()).resolves.toEqual({ value: 1 });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('refetches when invalidate is true', async () => {
    const fetcher = jest
      .fn<() => Promise<{ value: number }>>()
      .mockResolvedValueOnce({ value: 1 })
      .mockResolvedValueOnce({ value: 2 });
    const cache = new Cache({
      name: 'unit.invalidate',
      ttlSeconds: 60,
      store: new InMemoryCacheStore(),
      fetcher,
    });

    await expect(cache.get()).resolves.toEqual({ value: 1 });
    await expect(cache.get({ invalidate: true })).resolves.toEqual({ value: 2 });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('requires params for keyed caches', async () => {
    const fetcher = jest.fn(async (params: { id: string }) => ({ id: params.id }));
    const cache = new Cache<{ id: string }, { id: string }>({
      name: 'unit.keyed',
      ttlSeconds: 60,
      store: new InMemoryCacheStore(),
      fetcher,
    });

    await expect(cache.get({ id: 'a' })).resolves.toEqual({ id: 'a' });
    await expect(cache.get({ id: 'a' })).resolves.toEqual({ id: 'a' });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('createCache rejects duplicate names', () => {
    createCache({
      name: 'unit.dup',
      ttlSeconds: 60,
      store: new InMemoryCacheStore(),
      fetcher: async () => null,
    });

    expect(() =>
      createCache({
        name: 'unit.dup',
        ttlSeconds: 60,
        store: new InMemoryCacheStore(),
        fetcher: async () => null,
      }),
    ).toThrow(/already exists/);
  });
});
