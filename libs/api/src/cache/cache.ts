import { logger } from '../logger';
import { safeJsonStringify } from '../utils/safe-json-stringify';
import type { CacheStore } from './cache-store';

export type CacheProps<Entity, Params = void> = {
  /** Time-to-live in seconds. */
  ttlSeconds: number;
  /** Unique cache name within the process / store namespace. */
  name: string;
  store: CacheStore;
  /** Custom cache key segment. Defaults to stable JSON of `params`. */
  keyGetter?: (params: Params) => string;
  /** Loads an entity when the cache misses (or when invalidated). */
  fetcher: (params: Params) => Promise<Entity>;
  /** Runs before returning a value from cache or fetcher. */
  processor?: (params: Params, entity: Entity) => Entity | Promise<Entity>;
};

export type CacheGetOptions = {
  /** When true, skip read and refresh the cache from `fetcher`. */
  invalidate?: boolean;
};

/** Keyless caches (`Params = void`) omit the params argument. */
type CacheGetArgs<Params> = [Params] extends [void]
  ? [options?: CacheGetOptions]
  : [params: Params, options?: CacheGetOptions];

type CacheClearArgs<Params> = [Params] extends [void] ? [] : [params: Params];

export class Cache<Entity, Params = void> {
  /** True when the cache is a single entry (no params key). */
  private readonly keyless: boolean;

  public constructor(private readonly props: CacheProps<Entity, Params>) {
    // Keyless fetchers are declared as `async () => …` (arity 0).
    this.keyless = props.fetcher.length === 0;
  }

  private buildKey(params: Params): string {
    const entryKey =
      this.props.keyGetter?.(params) ??
      (params === undefined || params === null ? '' : safeJsonStringify(params));

    return entryKey ? `cache:${this.props.name}:${entryKey}` : `cache:${this.props.name}`;
  }

  private unpackGetArgs(args: CacheGetArgs<Params>): {
    params: Params;
    options: CacheGetOptions;
  } {
    if (this.keyless) {
      return {
        params: undefined as Params,
        options: (args[0] as CacheGetOptions | undefined) ?? {},
      };
    }

    return {
      params: args[0] as Params,
      options: (args[1] as CacheGetOptions | undefined) ?? {},
    };
  }

  public async get(...args: CacheGetArgs<Params>): Promise<Entity> {
    const { params, options } = this.unpackGetArgs(args);
    const { invalidate = false } = options;
    const cacheKey = this.buildKey(params);
    let restoredFromCache = false;
    let entity: Entity | null = null;

    if (invalidate) {
      await this.props.store.delete(cacheKey);
    } else {
      try {
        const cached = await this.props.store.get(cacheKey);
        if (cached != null) {
          entity = JSON.parse(cached) as Entity;
          restoredFromCache = true;
        }
      } catch (error) {
        logger.error('Unable to restore entity from cache', {
          cacheName: this.props.name,
          params,
          error,
        });
      }
    }

    if (entity == null) {
      entity = await this.props.fetcher(params);
    }

    if (!restoredFromCache) {
      try {
        await this.props.store.set(cacheKey, JSON.stringify(entity), this.props.ttlSeconds);
      } catch (error) {
        logger.error('Unable to store entity to cache', {
          cacheName: this.props.name,
          params,
          error,
        });
      }
    }

    return (await this.props.processor?.(params, entity)) ?? entity;
  }

  public async clear(...args: CacheClearArgs<Params>): Promise<void> {
    const params = (this.keyless ? undefined : args[0]) as Params;
    await this.props.store.delete(this.buildKey(params));
  }
}

const caches = new Map<string, Cache<unknown, unknown>>();

export function createCache<Entity, Params = void>(props: CacheProps<Entity, Params>): Cache<Entity, Params> {
  if (caches.has(props.name)) {
    throw new Error(`Cache with specified name already exists: ${props.name}`);
  }

  const cache = new Cache(props);
  caches.set(props.name, cache as Cache<unknown, unknown>);
  return cache;
}

/** Test helper — clears the `createCache` registry. */
export function resetCacheRegistry(): void {
  caches.clear();
}
