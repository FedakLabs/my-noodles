import { LocaleContext } from '@my-noodles/api-lib/locale';
import {
  APP_LOCALE_TO_MEEST_LOCALE,
  PublicMeestApi,
  type MeestBranchRow,
  type MeestDistrictRow,
  type MeestLocalizedName,
  type MeestLocalityData,
  type MeestRegionRow,
} from '@my-noodles/integration-api-clients/meest';
import { Inject, Injectable } from '@nestjs/common';

import type { DeliveryCity, DeliveryWarehouse } from '@/application/delivery/delivery.types';

import { MEEST_REGION_NAMES_UA } from './meest.regions';

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
  private districtById: Map<string, MeestDistrictRow> | undefined;
  private regionById: Map<string, MeestRegionRow> | undefined;
  private geoDirectoriesPromise: Promise<void> | undefined;

  constructor(@Inject(PublicMeestApi) private readonly meestApi: PublicMeestApi) {}

  async searchCities(query: string): Promise<DeliveryCity[]> {
    const localities = await this.meestApi.searchLocalities(query);
    const needsRegionEnrichment = localities.some(
      (locality) => !locality.reg?.trim() && Boolean(locality.d_id?.trim()),
    );

    if (needsRegionEnrichment) {
      await this.ensureGeoDirectories();
    }

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
    const normalizedQuery = query?.trim().toLowerCase();

    return branches
      .filter((branch) => this.matchesWarehouseQuery(branch, normalizedQuery))
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

  private formatCityName(locality: MeestLocalityData): string {
    // geo_localities has no lang filter / English name; keep Ukrainian primary fields.
    return formatMeestCityName({
      type: locality.t_ua?.trim() || undefined,
      name: locality.n_ua.trim(),
      district: locality.dis?.trim() || undefined,
      region: this.resolveRegionName(locality),
    });
  }

  private resolveRegionName(locality: MeestLocalityData): string | undefined {
    const direct = locality.reg?.trim();
    if (direct) {
      return direct;
    }

    const districtId = locality.d_id?.trim();
    if (!districtId || !this.districtById || !this.regionById) {
      return undefined;
    }

    const district = this.districtById.get(districtId);
    const region = district ? this.regionById.get(district.region_id) : undefined;
    return region?.ua.trim() || undefined;
  }

  private async ensureGeoDirectories(): Promise<void> {
    if (this.districtById && this.regionById) {
      return;
    }

    this.geoDirectoriesPromise ??= this.loadGeoDirectories();
    await this.geoDirectoriesPromise;
  }

  private async loadGeoDirectories(): Promise<void> {
    try {
      const [districts, regions] = await Promise.all([
        this.meestApi.getDistricts(),
        this.meestApi.getRegions(),
      ]);

      this.districtById = new Map(districts.map((district) => [district.district_id, district]));

      // Prefer live `/geo_regions` when available; fall back to the static UA map
      // because Public API currently returns status 0 / empty result for that endpoint.
      const regionById = new Map<string, MeestRegionRow>(
        Object.entries(MEEST_REGION_NAMES_UA).map(([region_id, ua]) => [region_id, { region_id, ua }]),
      );

      for (const region of regions) {
        regionById.set(region.region_id, region);
      }

      this.regionById = regionById;
    } catch (error) {
      this.geoDirectoriesPromise = undefined;
      throw error;
    }
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

    const lang = APP_LOCALE_TO_MEEST_LOCALE[LocaleContext.get()];
    const primary = name[lang]?.trim();

    return primary || name.ua?.trim() || name.en?.trim() || name.ru?.trim() || undefined;
  }

  private matchesWarehouseQuery(branch: MeestBranchRow, query?: string): boolean {
    if (!query) {
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

    return haystack.includes(query);
  }
}
