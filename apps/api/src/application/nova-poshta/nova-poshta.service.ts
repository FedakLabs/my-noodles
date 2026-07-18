import { NovaPoshtaApi, type NovaPoshtaDirectoryCityRow } from '@my-noodles/api-clients/nova-poshta';
import { Inject, Injectable } from '@nestjs/common';

import type { DeliveryCity, DeliveryWarehouse } from '@/application/delivery/delivery.types';
import { DeliveryMethod } from '@/application/orders/order-delivery.dto';

import { NovaPoshtaException } from './nova-poshta.exceptions';

@Injectable()
export class NovaPoshtaService {
  constructor(@Inject(NovaPoshtaApi) private readonly novaPoshtaApi: NovaPoshtaApi) {}

  async searchCities(query: string, method: DeliveryMethod): Promise<DeliveryCity[]> {
    try {
      if (method === DeliveryMethod.Courier) {
        return await this.searchSettlements(query);
      }

      const cities = await this.novaPoshtaApi.getCities(query);
      const mapped = this.mapDirectoryCities(cities);
      if (mapped.length > 0) {
        return mapped;
      }

      return await this.searchCitiesFromSearchSettlements(query);
    } catch (error) {
      throw NovaPoshtaException.from(error);
    }
  }

  async searchWarehouses(cityRef: string, query?: string): Promise<DeliveryWarehouse[]> {
    try {
      const response = await this.novaPoshtaApi.getWarehouses(cityRef, query);

      return response.map((warehouse) => ({
        ref: warehouse.Ref,
        number: warehouse.Number,
        name: warehouse.Description,
        address: warehouse.ShortAddress,
      }));
    } catch (error) {
      throw NovaPoshtaException.from(error);
    }
  }

  private async searchSettlements(query: string): Promise<DeliveryCity[]> {
    const response = await this.novaPoshtaApi.searchSettlements(query);
    const addresses = response.flatMap((row) => row.Addresses ?? []);

    return addresses.map((address) => ({
      ref: address.Ref,
      name: address.Present,
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
