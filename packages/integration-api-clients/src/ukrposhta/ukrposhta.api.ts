import { ApiClient } from '@my-noodles/api-lib/api-client';

export type UkrposhtaClientOptions = {
  apiBaseUrl: string;
};

type UkrposhtaEntries<T> = {
  Entries?: {
    Entry?: T | T[];
  };
};

export type UkrposhtaRegionRow = {
  REGION_ID: string | number;
  REGION_UA: string;
  REGION_EN?: string | null;
  REGION_KATOTTG?: string | null;
  REGION_KOATUU?: string | null;
  REGION_RU?: string | null;
};

export type UkrposhtaDistrictRow = {
  REGION_ID: string | number;
  DISTRICT_ID: string | number;
  DISTRICT_UA: string;
  DISTRICT_EN?: string | null;
  DISTRICT_RU?: string | null;
  DISTRICT_KATOTTG?: string | null;
  DISTRICT_KOATUU?: string | null;
  REGION_UA?: string | null;
  REGION_EN?: string | null;
  REGION_RU?: string | null;
  REGION_KATOTTG?: string | null;
  REGION_KOATUU?: string | null;
  NEW_DISTRICT_UA?: string | null;
};

export type UkrposhtaCityRow = {
  CITY_ID: string | number;
  CITY_UA: string;
  SHORTCITYTYPE_UA?: string | null;
  CITYTYPE_UA?: string | null;
  REGION_ID?: string | number | null;
  REGION_UA?: string | null;
  REGION_EN?: string | null;
  DISTRICT_ID?: string | number | null;
  DISTRICT_UA?: string | null;
  DISTRICT_EN?: string | null;
  CITY_KOATUU?: string | null;
  CITY_KATOTTG?: string | null;
  OWNOF?: string | null;
  CITY_EN?: string | null;
};

export type UkrposhtaPostOfficeRow = {
  POSTOFFICE_ID: string | number;
  POSTOFFICE_UA?: string | null;
  POSTCODE?: string | number | null;
  STREET_UA_VPZ?: string | null;
  HOUSENUMBER?: string | number | null;
  LOCK_CODE?: string | number | null;
  IS_SECURITY?: string | number | null;
  CITY_ID?: string | number | null;
  CITY_UA?: string | null;
  TYPE_ACRONYM?: string | null;
  TYPE_LONG?: string | null;
  PHONE?: string | null;
};

export type UkrposhtaStreetRow = {
  STREET_ID: string | number;
  STREET_UA: string;
  SHORTSTREETTYPE_UA?: string | null;
  STREETTYPE_UA?: string | null;
  CITY_ID?: string | number | null;
  CITY_UA?: string | null;
  DISTRICT_ID?: string | number | null;
  DISTRICT_UA?: string | null;
  REGION_ID?: string | number | null;
  REGION_UA?: string | null;
  STREET_EN?: string | null;
};

export type UkrposhtaHouseRow = {
  STREET_ID: string | number;
  POSTCODE: string | number;
  HOUSENUMBER_UA: string | number;
};

export type UkrposhtaSearchCitiesParams = {
  cityUa: string;
  regionId?: string;
  districtId?: string;
};

export type UkrposhtaGetPostOfficesParams = {
  cityId?: string;
  cityKoatuu?: string;
  cityKatottg?: string;
};

export class UkrposhtaApi extends ApiClient {
  constructor(private readonly settings: UkrposhtaClientOptions) {
    super();
  }

  protected getBaseUrl(): string {
    return this.settings.apiBaseUrl;
  }

  async searchRegions(regionName: string): Promise<UkrposhtaRegionRow[]> {
    const response = await this.get<UkrposhtaEntries<UkrposhtaRegionRow>>({
      url: '/get_regions_by_region_ua',
      params: { region_name: regionName },
      headers: this.defaultHeaders(),
    });

    return this.unwrapEntries(response);
  }

  async searchDistricts(regionId: string, districtUa?: string): Promise<UkrposhtaDistrictRow[]> {
    const response = await this.get<UkrposhtaEntries<UkrposhtaDistrictRow>>({
      url: '/get_districts_by_region_id_and_district_ua',
      params: {
        region_id: regionId,
        ...(districtUa ? { district_ua: districtUa } : {}),
      },
      headers: this.defaultHeaders(),
    });

    return this.unwrapEntries(response);
  }

  async searchCities(params: UkrposhtaSearchCitiesParams): Promise<UkrposhtaCityRow[]> {
    const response = await this.get<UkrposhtaEntries<UkrposhtaCityRow>>({
      url: '/get_city_by_region_id_and_district_id_and_city_ua',
      params: {
        city_ua: params.cityUa,
        ...(params.regionId ? { region_id: params.regionId } : {}),
        ...(params.districtId ? { district_id: params.districtId } : {}),
      },
      headers: this.defaultHeaders(),
    });

    return this.unwrapEntries(response);
  }

  async getPostOffices(params: UkrposhtaGetPostOfficesParams): Promise<UkrposhtaPostOfficeRow[]> {
    const response = await this.get<UkrposhtaEntries<UkrposhtaPostOfficeRow>>({
      url: '/get_postoffices_by_postcode_cityid_cityvpzid',
      params: {
        ...(params.cityId ? { city_id: params.cityId } : {}),
        ...(params.cityKoatuu ? { city_koatuu: params.cityKoatuu } : {}),
        ...(params.cityKatottg ? { city_katottg: params.cityKatottg } : {}),
      },
      headers: this.defaultHeaders(),
    });

    return this.unwrapEntries(response).filter((office) => this.isActiveWarehouse(office));
  }

  async searchStreets(cityId: string, streetUa: string): Promise<UkrposhtaStreetRow[]> {
    const response = await this.get<UkrposhtaEntries<UkrposhtaStreetRow>>({
      url: '/get_street_by_region_id_and_district_id_and_city_id_and_street_ua',
      params: { city_id: cityId, street_ua: streetUa },
      headers: this.defaultHeaders(),
    });

    return this.unwrapEntries(response);
  }

  async searchHouses(streetId: string, housenumber: string): Promise<UkrposhtaHouseRow[]> {
    const response = await this.get<UkrposhtaEntries<UkrposhtaHouseRow>>({
      url: '/get_addr_house_by_street_id',
      params: { street_id: streetId, housenumber },
      headers: this.defaultHeaders(),
    });

    return this.unwrapEntries(response);
  }

  private defaultHeaders() {
    return {
      Accept: 'application/json',
      'User-Agent': 'my-noodles-delivery/1.0',
    };
  }

  private isActiveWarehouse(office: UkrposhtaPostOfficeRow): boolean {
    if (String(office.LOCK_CODE ?? '') !== '0') {
      return false;
    }

    if (String(office.IS_SECURITY ?? '') === '1') {
      return false;
    }

    return true;
  }

  private unwrapEntries<T>(payload: UkrposhtaEntries<T> | undefined): T[] {
    const entry = payload?.Entries?.Entry;

    if (!entry) {
      return [];
    }

    return Array.isArray(entry) ? entry : [entry];
  }
}
