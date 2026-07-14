import { Injectable } from '@nestjs/common';

import type { DeliveryMethod, DeliveryProvider } from '../orders/order-delivery.dto';
import type { DeliveryCity, DeliveryWarehouse } from './delivery.types';

type CacheEntry<T> = {
  expiresAt: number;
  value: T;
};

const CATALOG_TTL_MS = 5 * 60_000;

@Injectable()
export class DeliveryCatalogCache {
  private readonly cities = new Map<string, CacheEntry<DeliveryCity[]>>();
  private readonly warehouses = new Map<string, CacheEntry<DeliveryWarehouse[]>>();

  getCities(provider: DeliveryProvider, method: DeliveryMethod, query: string): DeliveryCity[] | null {
    return this.get(this.cities, this.citiesKey(provider, method, query));
  }

  setCities(provider: DeliveryProvider, method: DeliveryMethod, query: string, value: DeliveryCity[]): void {
    this.set(this.cities, this.citiesKey(provider, method, query), value);
  }

  getWarehouses(provider: DeliveryProvider, cityRef: string, query?: string): DeliveryWarehouse[] | null {
    return this.get(this.warehouses, this.warehousesKey(provider, cityRef, query));
  }

  setWarehouses(
    provider: DeliveryProvider,
    cityRef: string,
    value: DeliveryWarehouse[],
    query?: string,
  ): void {
    this.set(this.warehouses, this.warehousesKey(provider, cityRef, query), value);
  }

  private citiesKey(provider: DeliveryProvider, method: DeliveryMethod, query: string): string {
    return `${provider}:${method}:cities:${query.trim().toLowerCase()}`;
  }

  private warehousesKey(provider: DeliveryProvider, cityRef: string, query?: string): string {
    return `${provider}:warehouses:${cityRef}:${query?.trim().toLowerCase() ?? ''}`;
  }

  private get<T>(store: Map<string, CacheEntry<T>>, key: string): T | null {
    const entry = store.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt <= Date.now()) {
      store.delete(key);
      return null;
    }

    return entry.value;
  }

  private set<T>(store: Map<string, CacheEntry<T>>, key: string, value: T): void {
    store.set(key, { value, expiresAt: Date.now() + CATALOG_TTL_MS });
  }
}
