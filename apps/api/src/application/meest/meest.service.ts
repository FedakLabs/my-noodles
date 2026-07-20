import {
  PublicMeestApi,
  type MeestBranchRow,
  type MeestLocalizedName,
  type MeestLocalityData,
} from '@my-noodles/integration-api-clients/meest';
import { hasLatin, latinToUk } from '@my-noodles/translit';
import { Inject, Injectable } from '@nestjs/common';

import type { DeliveryCity, DeliveryWarehouse } from '@/application/delivery/delivery.types';

export type MeestCityNameParts = {
  type?: string;
  name: string;
  district?: string;
  region?: string;
};

export function formatMeestCityName({ type, name, district, region }: MeestCityNameParts): string {
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

/** Short list uses `num_showcase`; full `viewdata` puts the number in `num` and omits `num_showcase`. */
export function extractMeestWarehouseNumber(branch: MeestBranchRow): string {
  if (branch.num_showcase != null && String(branch.num_showcase).trim() !== '') {
    return String(branch.num_showcase);
  }

  if (branch.num == null) {
    return '';
  }

  const num = String(branch.num).trim();
  // Short list stores the branch UUID in `num` for backward compatibility.
  if (!num || /^[0-9a-f-]{36}$/i.test(num)) {
    return '';
  }

  return num;
}

@Injectable()
export class MeestService {
  constructor(@Inject(PublicMeestApi) private readonly meestApi: PublicMeestApi) {}

  async searchCities(query: string): Promise<DeliveryCity[]> {
    const localities = await this.meestApi.searchLocalities(this.toSearchQuery(query));
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
        name: this.formatCityName(locality),
      }));
  }

  async searchWarehouses(cityRef: string, query?: string): Promise<DeliveryWarehouse[]> {
    const branches = await this.meestApi.getBranches(cityRef);

    return branches
      .filter((branch) => this.matchesWarehouseQuery(branch, query))
      .map((branch) => {
        const number = extractMeestWarehouseNumber(branch);

        return {
          ref: branch.br_id,
          number,
          name: this.formatWarehouseName(branch, number),
          address: this.formatWarehouseAddress(branch),
        };
      });
  }

  private toSearchQuery(query: string): string {
    if (!hasLatin(query)) {
      return query;
    }

    return latinToUk(query);
  }

  private formatCityName(locality: MeestLocalityData): string {
    // Region enrichment (empty `reg`) is handled inside PublicMeestApi.searchLocalities.
    return formatMeestCityName({
      type: locality.t_ua?.trim() || undefined,
      name: locality.n_ua.trim(),
      district: locality.dis?.trim() || undefined,
      region: locality.reg?.trim() || undefined,
    });
  }

  private formatWarehouseName(branch: MeestBranchRow, number: string): string {
    // Mirror Nova Poshta: type + number + street (+ landmark). City stays on `address`.
    const type = this.pickLocalized(branch.type_public);
    const streetLine = this.formatStreetLine(branch);
    const location = branch.location_description?.trim();

    let title = type && number ? `${type} №${number}` : (type ?? (number ? `№${number}` : undefined));

    if (title && streetLine) {
      title = `${title}: ${streetLine}`;
    } else {
      title ??= streetLine;
    }

    if (title && location) {
      return `${title} (${location})`;
    }

    return title ?? this.pickLocalized(branch.city) ?? branch.br_id;
  }

  private formatWarehouseAddress(branch: MeestBranchRow): string | undefined {
    const city = this.pickLocalized(branch.city);
    const streetLine = this.formatStreetLine(branch);

    if (city && streetLine) {
      return `${city}, ${streetLine}`;
    }

    return city ?? streetLine ?? undefined;
  }

  private formatStreetLine(branch: MeestBranchRow): string | undefined {
    const street = this.pickLocalized(branch.street);
    const streetNumber = branch.street_number?.trim();

    if (!street) {
      return undefined;
    }

    return streetNumber ? `${street}, ${streetNumber}` : street;
  }

  private pickLocalized(name: MeestLocalizedName | undefined): string | undefined {
    if (!name) {
      return undefined;
    }

    return name.ua?.trim() || name.en?.trim() || name.ru?.trim() || undefined;
  }

  private matchesWarehouseQuery(branch: MeestBranchRow, query?: string): boolean {
    const trimmed = query?.trim();
    if (!trimmed) {
      return true;
    }

    const haystack = [
      extractMeestWarehouseNumber(branch),
      this.pickLocalized(branch.type_public),
      this.pickLocalized(branch.city),
      this.pickLocalized(branch.street),
      branch.street_number,
      branch.zip,
      branch.location_description,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    // Keep the original (for Latin landmarks like "Rozetka") and UA transliteration (for streets).
    const needles = new Set([trimmed.toLowerCase(), this.toSearchQuery(trimmed).toLowerCase()]);

    return [...needles].some((needle) => haystack.includes(needle));
  }
}
