import { ApiClient } from '@my-noodles/api-lib/api-client';
import { Cache, InMemoryCacheStore } from '@my-noodles/api-lib/cache';

import { MEEST_GEO_DIRECTORY_TTL_SECONDS, MEEST_REGION_NAMES_UA } from './meest.api.config';
import type {
  MeestApiResponse,
  MeestBranchRow,
  MeestClientOptions,
  MeestDistrictRow,
  MeestGeoDirectories,
  MeestLocalityData,
  MeestLocalityRow,
  MeestRegionRow,
} from './meest.api.dto';

export type {
  MeestBranchRow,
  MeestClientOptions,
  MeestDistrictRow,
  MeestLocalityData,
  MeestLocalityRow,
  MeestRegionRow,
} from './meest.api.dto';

export class PublicMeestApi extends ApiClient {
  private readonly districtsCache: Cache<MeestDistrictRow[]>;
  private readonly regionsCache: Cache<MeestRegionRow[]>;

  constructor(private readonly settings: MeestClientOptions) {
    super();
    this.districtsCache = new Cache({
      name: 'meest.districts',
      ttlSeconds: MEEST_GEO_DIRECTORY_TTL_SECONDS,
      store: new InMemoryCacheStore(),
      fetcher: async () => await this.fetchDistricts(),
    });
    this.regionsCache = new Cache({
      name: 'meest.regions',
      ttlSeconds: MEEST_GEO_DIRECTORY_TTL_SECONDS,
      store: new InMemoryCacheStore(),
      fetcher: async () => await this.fetchRegions(),
    });
  }

  protected getBaseUrl(): string {
    return this.settings.apiBaseUrl;
  }

  /**
   * Locality search with oblast filled in when `/geo_localities` leaves `reg` empty
   * (resolve via `d_id` → districts → regions, with a static region-name fallback).
   */
  async searchLocalities(query: string): Promise<MeestLocalityData[]> {
    const response = await this.get<MeestApiResponse<MeestLocalityRow[]> | MeestLocalityRow[]>({
      url: '/geo_localities',
      params: { search_beginning: query },
    });

    const localities = this.unwrapLocalities(response);
    const needsRegionEnrichment = localities.some(
      (locality) => !locality.reg?.trim() && Boolean(locality.d_id?.trim()),
    );

    if (!needsRegionEnrichment) {
      return localities;
    }

    const directories = await this.resolveGeoDirectories();
    return localities.map((locality) => this.withResolvedRegion(locality, directories));
  }

  async getDistricts(): Promise<MeestDistrictRow[]> {
    return await this.districtsCache.get();
  }

  async getRegions(): Promise<MeestRegionRow[]> {
    return await this.regionsCache.get();
  }

  async getBranches(cityRef: string): Promise<MeestBranchRow[]> {
    const response = await this.get<MeestApiResponse<MeestBranchRow[]> | MeestBranchRow[]>({
      url: '/branches',
      params: { city: cityRef, lang: 'ua', viewdata: 'full' },
    });

    return this.unwrapBranches(response);
  }

  private async fetchDistricts(): Promise<MeestDistrictRow[]> {
    const response = await this.get<MeestApiResponse<MeestDistrictRow[]> | MeestDistrictRow[]>({
      url: '/geo_districts',
    });

    return this.unwrapResult(response).filter((district): district is MeestDistrictRow =>
      Boolean(district.district_id && district.region_id && district.ua),
    );
  }

  private async fetchRegions(): Promise<MeestRegionRow[]> {
    const response = await this.get<MeestApiResponse<MeestRegionRow[]> | MeestRegionRow[]>({
      url: '/geo_regions',
    });

    return this.unwrapResult(response).filter((region): region is MeestRegionRow =>
      Boolean(region.region_id && region.ua),
    );
  }

  private async resolveGeoDirectories(): Promise<MeestGeoDirectories> {
    const [districts, regions] = await Promise.all([this.getDistricts(), this.getRegions()]);

    const districtById = new Map(districts.map((district) => [district.district_id, district]));

    // Prefer live `/geo_regions` when available; fall back to the static UA map
    // because Public API currently returns status 0 / empty result for that endpoint.
    const regionById = new Map<string, MeestRegionRow>(
      Object.entries(MEEST_REGION_NAMES_UA).map(([region_id, ua]) => [region_id, { region_id, ua }]),
    );

    for (const region of regions) {
      regionById.set(region.region_id, region);
    }

    return { districtById, regionById };
  }

  private withResolvedRegion(
    locality: MeestLocalityData,
    directories: MeestGeoDirectories,
  ): MeestLocalityData {
    if (locality.reg?.trim()) {
      return locality;
    }

    const districtId = locality.d_id?.trim();
    if (!districtId) {
      return locality;
    }

    const district = directories.districtById.get(districtId);
    const region = district ? directories.regionById.get(district.region_id) : undefined;
    const regionName = region?.ua.trim();
    if (!regionName) {
      return locality;
    }

    return {
      ...locality,
      reg: regionName,
      reg_id: district?.region_id || locality.reg_id,
    };
  }

  private unwrapLocalities(
    payload: MeestApiResponse<MeestLocalityRow[]> | MeestLocalityRow[],
  ): MeestLocalityData[] {
    const rows = this.unwrapResult(payload);

    return rows
      .map((row) => ('data' in row ? row.data : row))
      .filter((locality): locality is MeestLocalityData => Boolean(locality.city_id && locality.n_ua));
  }

  private unwrapBranches(payload: MeestApiResponse<MeestBranchRow[]> | MeestBranchRow[]): MeestBranchRow[] {
    return this.unwrapResult(payload).filter((branch): branch is MeestBranchRow => Boolean(branch.br_id));
  }

  private unwrapResult<T>(payload: MeestApiResponse<T[]> | T[] | undefined): T[] {
    if (!payload) {
      return [];
    }

    if (Array.isArray(payload)) {
      return payload;
    }

    return Array.isArray(payload.result) ? payload.result : [];
  }
}
