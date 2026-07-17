import { ApiClient } from '@my-noodles/api-lib/api-client';
import type { Logger } from 'winston';

export type UkrposhtaClientOptions = {
  apiBaseUrl: string;
  apiKey: string;
};

type UkrposhtaEntries<T> = {
  Entries?: {
    Entry?: T | T[];
  };
};

export type UkrposhtaCityRow = {
  CITY_ID: string | number;
  CITY_UA: string;
  SHORTCITYTYPE_UA?: string | null;
  REGION_UA?: string | null;
  DISTRICT_UA?: string | null;
};

export type UkrposhtaPostOfficeRow = {
  ID: string | number;
  PO_SHORT?: string | null;
  PO_LONG?: string | null;
  POSTINDEX?: string | number | null;
  ADDRESS?: string | null;
  LOCK_CODE?: string | number | null;
  IS_SECURITY?: string | number | null;
};

export class UkrposhtaApi extends ApiClient {
  constructor(
    private readonly settings: UkrposhtaClientOptions,
    logger: Logger,
  ) {
    super(logger);
  }

  protected getBaseUrl(): string {
    return this.settings.apiBaseUrl;
  }

  async searchCities(query: string): Promise<UkrposhtaCityRow[]> {
    const response = await this.get<UkrposhtaEntries<UkrposhtaCityRow>>({
      url: '/get_city_by_region_id_and_district_id_and_city_ua',
      params: { city_ua: query },
      headers: this.authHeaders(),
    });

    return this.unwrapEntries(response);
  }

  async getPostOffices(cityId: string): Promise<UkrposhtaPostOfficeRow[]> {
    const response = await this.get<UkrposhtaEntries<UkrposhtaPostOfficeRow>>({
      url: '/get_postoffices_by_postcode_cityid_cityvpzid',
      params: { city_id: cityId },
      headers: this.authHeaders(),
    });

    return this.unwrapEntries(response).filter((office) => this.isActiveWarehouse(office));
  }

  private authHeaders() {
    return {
      Accept: 'application/json',
      Authorization: `Bearer ${this.settings.apiKey}`,
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
