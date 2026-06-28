import { Inject, Injectable } from '@nestjs/common';

import type { DeliveryCity, DeliveryWarehouse } from '@/application/delivery/delivery.types';

import { MeestApi, type MeestBranchRow, type MeestLocalityData } from './meest.api';

@Injectable()
export class MeestService {
  constructor(@Inject(MeestApi) private readonly meestApi: MeestApi) {}

  isConfigured(): boolean {
    return this.meestApi.isConfigured();
  }

  async searchCities(query: string): Promise<DeliveryCity[]> {
    const localities = await this.meestApi.searchLocalities(query);
    const seen = new Set<string>();

    return localities
      .filter((locality) => {
        if (seen.has(locality.city_id)) {
          return false;
        }

        seen.add(locality.city_id);
        return true;
      })
      .map((locality) => ({
        ref: locality.city_id,
        name: formatMeestCityName(locality),
      }));
  }

  async listPopularCities(): Promise<DeliveryCity[]> {
    const seeds = ['Ки', 'Льв', 'Оде', 'Хар', 'Дні'];
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
    const branches = await this.meestApi.getBranches(cityRef);
    const normalizedQuery = query?.trim().toLowerCase();

    return branches
      .filter((branch) => matchesMeestWarehouseQuery(branch, normalizedQuery))
      .map((branch) => ({
        ref: branch.br_id,
        number: String(branch.num_showcase ?? ''),
        name: formatMeestWarehouseName(branch),
        address: formatMeestWarehouseAddress(branch),
      }));
  }
}

export function formatMeestCityName(locality: MeestLocalityData): string {
  const type = locality.t_ua?.trim();
  const name = locality.n_ua.trim();
  const region = locality.reg?.trim();
  const district = locality.dis?.trim();
  const cityLabel = type ? `${type} ${name}` : name;

  if (region && district && district !== region) {
    return `${cityLabel}, ${district}, ${region}`;
  }

  if (region) {
    return `${cityLabel}, ${region}`;
  }

  return cityLabel;
}

export function formatMeestWarehouseName(branch: MeestBranchRow): string {
  const type = branch.type_public?.ua?.trim();
  const number = branch.num_showcase;
  const city = branch.city?.ua?.trim();

  if (type && number) {
    return city ? `${type} №${number}, ${city}` : `${type} №${number}`;
  }

  return city ?? type ?? branch.br_id;
}

export function formatMeestWarehouseAddress(branch: MeestBranchRow): string | undefined {
  const street = branch.street?.ua?.trim();
  const streetNumber = branch.street_number?.trim();
  const city = branch.city?.ua?.trim();
  const zip = branch.zip?.trim();

  const streetLine = street ? (streetNumber ? `${street}, ${streetNumber}` : street) : undefined;

  if (streetLine && city) {
    return zip ? `${streetLine}, ${city}, ${zip}` : `${streetLine}, ${city}`;
  }

  return streetLine ?? city ?? undefined;
}

function matchesMeestWarehouseQuery(branch: MeestBranchRow, query?: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = [
    branch.num_showcase,
    branch.type_public?.ua,
    branch.city?.ua,
    branch.street?.ua,
    branch.street_number,
    branch.zip,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}
