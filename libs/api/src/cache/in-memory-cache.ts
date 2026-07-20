import type { CacheStore } from './cache-store';

type InMemoryCacheEntry = {
  value: string;
  expiresAt: number;
};

/** Process-local TTL cache (single Node.js process). */
export class InMemoryCacheStore implements CacheStore {
  private readonly entries = new Map<string, InMemoryCacheEntry>();

  async get(key: string): Promise<string | null> {
    const entry = this.entries.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      this.entries.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.entries.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async delete(key: string): Promise<void> {
    this.entries.delete(key);
  }
}
