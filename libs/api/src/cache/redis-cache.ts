import type { CacheStore } from './cache-store';

/**
 * Placeholder Redis-backed store. Wire a real client when Redis lands in the stack.
 */
export class RedisCacheStore implements CacheStore {
  async get(_key: string): Promise<string | null> {
    throw new Error('RedisCacheStore is not implemented yet');
  }

  async set(_key: string, _value: string, _ttlSeconds: number): Promise<void> {
    throw new Error('RedisCacheStore is not implemented yet');
  }

  async delete(_key: string): Promise<void> {
    throw new Error('RedisCacheStore is not implemented yet');
  }
}
