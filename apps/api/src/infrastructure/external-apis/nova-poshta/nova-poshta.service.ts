import { Inject, Injectable } from '@nestjs/common';

import type { DeliveryCity, DeliveryWarehouse } from '@/application/delivery/delivery.types';

import { NovaPoshtaApi, type NovaPoshtaDirectoryCityRow } from './nova-poshta.api';

@Injectable()
export class NovaPoshtaService {
  constructor(@Inject(NovaPoshtaApi) private readonly novaPoshtaApi: NovaPoshtaApi) {}

  isConfigured(): boolean {
    return this.novaPoshtaApi.isConfigured();
  }

  hasApiKey(): boolean {
    return this.novaPoshtaApi.hasApiKey();
  }

  async searchCities(query: string): Promise<DeliveryCity[]> {
    if (this.novaPoshtaApi.hasApiKey()) {
      const cities = await this.novaPoshtaApi.getCities(query);
      const mapped = this.mapDirectoryCities(cities);
      if (mapped.length > 0) {
        return mapped;
      }

      return this.searchCitiesFromSearchSettlements(query);
    }

    const settlements = await this.novaPoshtaApi.getSettlements(query);
    return this.mapDirectoryCities(settlements);
  }

  async listPopularCities(): Promise<DeliveryCity[]> {
    const seeds = ['Київ', 'Львів', 'Одеса', 'Харків', 'Дніпро'];
    const batches = await Promise.all(seeds.map((seed) => this.searchCities(seed)));
    const seen = new Set<string>();

    return batches
      .flat()
      .filter((city) => {
        if (seen.has(city.ref)) {
          return false;
        }

        seen.add(city.ref);
        return true;
      })
      .slice(0, 5);
  }

  async searchWarehouses(cityRef: string, query?: string): Promise<DeliveryWarehouse[]> {
    const response = await this.novaPoshtaApi.getWarehouses(cityRef, query);

    return response.map((warehouse) => ({
      ref: warehouse.Ref,
      number: warehouse.Number,
      name: warehouse.Description,
      address: warehouse.ShortAddress,
    }));
  }

  private async searchCitiesFromSearchSettlements(query: string): Promise<DeliveryCity[]> {
    const response = await this.novaPoshtaApi.searchSettlements(query);
    const addresses = response.flatMap((row) => row.Addresses ?? []);

    return addresses.map((address) => ({
      ref: address.DeliveryCity,
      name: address.Present,
    }));
  }

  private mapDirectoryCities(cities: NovaPoshtaDirectoryCityRow[]): DeliveryCity[] {
    const seen = new Set<string>();

    return cities
      .filter((city) => {
        if (seen.has(city.Ref)) {
          return false;
        }

        seen.add(city.Ref);
        return true;
      })
      .map((city) => ({
        ref: city.Ref,
        name: formatNovaPoshtaDirectoryCityName(city),
      }));
  }
}

export function formatNovaPoshtaDirectoryCityName(city: NovaPoshtaDirectoryCityRow): string {
  const type = city.SettlementTypeDescription?.trim();
  const name = city.Description.trim();
  const region = city.RegionsDescription?.trim();
  const area = city.AreaDescription?.trim();
  const cityLabel = type ? `${type} ${name}` : name;

  if (region && area && area !== region) {
    return `${cityLabel}, ${area}, ${region}`;
  }

  if (region) {
    return `${cityLabel}, ${region}`;
  }

  return cityLabel;
}
