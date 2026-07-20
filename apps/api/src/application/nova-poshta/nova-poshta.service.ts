import {
  NovaPoshtaApi,
  type NovaPoshtaDirectoryCityRow,
  type NovaPoshtaSettlementAddress,
  type NovaPoshtaWarehouseRow,
} from '@my-noodles/integration-api-clients/nova-poshta';
import { hasLatin, latinToUk } from '@my-noodles/translit';
import { Inject, Injectable } from '@nestjs/common';

import type { DeliveryCity, DeliveryWarehouse } from '@/application/delivery/delivery.types';
import { DeliveryMethod } from '@/application/orders/order-delivery.dto';

import { NovaPoshtaException } from './nova-poshta.exceptions';

@Injectable()
export class NovaPoshtaService {
  constructor(@Inject(NovaPoshtaApi) private readonly novaPoshtaApi: NovaPoshtaApi) {}

  async searchCities(query: string, method: DeliveryMethod): Promise<DeliveryCity[]> {
    const searchQuery = this.toSearchQuery(query);

    try {
      if (method === DeliveryMethod.Courier) {
        return await this.searchSettlements(searchQuery);
      }

      const cities = await this.novaPoshtaApi.getCities(searchQuery);
      const mapped = this.mapDirectoryCities(cities);
      if (mapped.length > 0) {
        return mapped;
      }

      return await this.searchCitiesFromSearchSettlements(searchQuery);
    } catch (error) {
      if (this.isSearchQueryError(error)) {
        return [];
      }

      throw NovaPoshtaException.from(error);
    }
  }

  async searchWarehouses(cityRef: string, query?: string): Promise<DeliveryWarehouse[]> {
    const searchQuery = query === undefined ? undefined : this.toSearchQuery(query);

    try {
      const warehouses = await this.novaPoshtaApi.getWarehouses(cityRef, searchQuery);
      return this.mapWarehouses(warehouses);
    } catch (error) {
      if (this.isSearchQueryError(error)) {
        return [];
      }

      throw NovaPoshtaException.from(error);
    }
  }

  private toSearchQuery(query: string): string {
    if (!hasLatin(query)) {
      return query;
    }

    return latinToUk(query);
  }

  private isSearchQueryError(error: unknown): boolean {
    const message = error instanceof Error ? error.message : String(error);
    const normalized = message.toLowerCase();

    return (
      normalized.includes('findbystring') ||
      normalized.includes('cityname') ||
      normalized.includes('invalid characters') ||
      normalized.includes('not specified')
    );
  }

  private async searchSettlements(query: string): Promise<DeliveryCity[]> {
    const response = await this.novaPoshtaApi.searchSettlements(query);
    const addresses = response.flatMap((row) => row.Addresses ?? []);

    return addresses.map((address) => ({
      ref: address.Ref,
      name: this.formatSettlementAddressName(address),
    }));
  }

  private async searchCitiesFromSearchSettlements(query: string): Promise<DeliveryCity[]> {
    const response = await this.novaPoshtaApi.searchSettlements(query);
    const addresses = response.flatMap((row) => row.Addresses ?? []);

    return addresses.map((address) => ({
      ref: address.DeliveryCity,
      name: this.formatSettlementAddressName(address),
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
        name: this.formatDirectoryCityName(city),
      }));
  }

  private formatDirectoryCityName(city: NovaPoshtaDirectoryCityRow): string {
    const type = city.SettlementTypeDescription?.trim();
    const name = city.Description.trim();
    // getCities: AreaDescription ≈ oblast, RegionsDescription ≈ raion/district.
    return this.formatCityLabel({
      type,
      name,
      district: city.RegionsDescription?.trim(),
      region: city.AreaDescription?.trim(),
    });
  }

  /**
   * Prefer structured settlement fields (same shape as Meest: place, raion, oblast).
   * `Present` alone is often just "село X" without region context.
   */
  private formatSettlementAddressName(address: NovaPoshtaSettlementAddress): string {
    const name = address.MainDescription?.trim();
    if (!name) {
      return address.Present;
    }

    return this.formatCityLabel({
      type: address.SettlementTypeCode?.trim(),
      name,
      district: address.Region?.trim(),
      region: address.Area?.trim(),
    });
  }

  /** Meest-aligned label: `{type} {name}, {district}, {oblast}`. */
  private formatCityLabel({
    type,
    name,
    district,
    region,
  }: {
    type?: string;
    name: string;
    district?: string;
    region?: string;
  }): string {
    const cityLabel = type ? `${type} ${name}` : name;

    if (region && district && district !== region) {
      return `${cityLabel}, ${district}, ${region}`;
    }

    if (region) {
      return `${cityLabel}, ${region}`;
    }

    if (district) {
      return `${cityLabel}, ${district}`;
    }

    return cityLabel;
  }

  private mapWarehouses(rows: NovaPoshtaWarehouseRow[]): DeliveryWarehouse[] {
    const seen = new Set<string>();

    return rows
      .filter((warehouse) => {
        if (seen.has(warehouse.Ref)) {
          return false;
        }

        seen.add(warehouse.Ref);
        return true;
      })
      .map((warehouse) => ({
        ref: warehouse.Ref,
        number: warehouse.Number,
        name: warehouse.Description,
        address: warehouse.ShortAddress,
      }));
  }
}
