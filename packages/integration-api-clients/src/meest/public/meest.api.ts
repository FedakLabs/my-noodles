import { ApiClient } from '@my-noodles/api-lib/api-client';
import { LocaleContext, type Locale } from '@my-noodles/api-lib/locale';

export type MeestClientOptions = {
  apiBaseUrl: string;
};

export const MEEST_LOCALES = ['ua', 'ru', 'en'] as const;
export type MeestLocale = (typeof MEEST_LOCALES)[number];

/** App locale → Meest `lang` / localized-name key. Extend when adding storefront locales. */
export const APP_LOCALE_TO_MEEST_LOCALE = {
  uk: 'ua',
  en: 'en',
} as const satisfies Record<Locale, MeestLocale>;

export type MeestLocalizedName = Partial<Record<MeestLocale, string>>;

function meestLang(): MeestLocale {
  return APP_LOCALE_TO_MEEST_LOCALE[LocaleContext.get()];
}

type MeestApiResponse<T> = {
  status?: number | string;
  msg?: string | null;
  result?: T;
};

export type MeestLocalityData = {
  n_ua: string;
  n_ru?: string;
  t_ua?: string;
  city_id: string;
  kt?: string;
  reg?: string;
  reg_id?: string;
  dis?: string;
  d_id?: string;
  is_delivery_in_city?: boolean;
};

export type MeestLocalityRow = MeestLocalityData | { data: MeestLocalityData };

export type MeestDistrictRow = {
  district_id: string;
  region_id: string;
  ua: string;
  ru?: string;
  en?: string;
  kt?: string;
};

export type MeestRegionRow = {
  region_id: string;
  ua: string;
  ru?: string;
  en?: string;
  kt?: string;
};

export type MeestBranchRow = {
  br_id: string;
  /** Short list: branch UUID. Full `viewdata`: showcase number. */
  num?: number | string;
  /** Short list only — real branch number within the city. Absent in full `viewdata`. */
  num_showcase?: number | string;
  type_id?: string;
  city_id?: string;
  type_public?: MeestLocalizedName;
  region?: MeestLocalizedName;
  district?: MeestLocalizedName;
  city?: MeestLocalizedName;
  street?: MeestLocalizedName;
  street_number?: string;
  zip?: string;
  /** Landmark / host shop, e.g. "Rozetka, на касі", "Тютюнова каса Сільпо". Full viewdata only. */
  location_description?: string;
  lng?: string;
  lat?: string;
};

export class PublicMeestApi extends ApiClient {
  constructor(private readonly settings: MeestClientOptions) {
    super();
  }

  protected getBaseUrl(): string {
    return this.settings.apiBaseUrl;
  }

  async searchLocalities(query: string): Promise<MeestLocalityData[]> {
    const response = await this.get<MeestApiResponse<MeestLocalityRow[]> | MeestLocalityRow[]>({
      url: '/geo_localities',
      params: { search_beginning: query },
      headers: this.defaultHeaders(),
    });

    return this.unwrapLocalities(response);
  }

  async getDistricts(): Promise<MeestDistrictRow[]> {
    const response = await this.get<MeestApiResponse<MeestDistrictRow[]> | MeestDistrictRow[]>({
      url: '/geo_districts',
      headers: this.defaultHeaders(),
    });

    return this.unwrapResult(response).filter((district): district is MeestDistrictRow =>
      Boolean(district.district_id && district.region_id && district.ua),
    );
  }

  async getRegions(): Promise<MeestRegionRow[]> {
    const response = await this.get<MeestApiResponse<MeestRegionRow[]> | MeestRegionRow[]>({
      url: '/geo_regions',
      headers: this.defaultHeaders(),
    });

    return this.unwrapResult(response).filter((region): region is MeestRegionRow =>
      Boolean(region.region_id && region.ua),
    );
  }

  async getBranches(cityRef: string): Promise<MeestBranchRow[]> {
    const response = await this.get<MeestApiResponse<MeestBranchRow[]> | MeestBranchRow[]>({
      url: '/branches',
      params: { city: cityRef, lang: meestLang(), viewdata: 'full' },
      headers: this.defaultHeaders(),
    });

    return this.unwrapBranches(response);
  }

  private defaultHeaders() {
    return {
      Accept: 'application/json',
      'User-Agent': 'my-noodles-delivery/1.0',
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
