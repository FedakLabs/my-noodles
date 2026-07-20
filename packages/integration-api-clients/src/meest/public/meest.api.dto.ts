import type { MEEST_LOCALES } from './meest.api.config';

export type MeestClientOptions = {
  apiBaseUrl: string;
};

export type MeestLocale = (typeof MEEST_LOCALES)[number];

export type MeestLocalizedName = Partial<Record<MeestLocale, string>>;

export type MeestApiResponse<T> = {
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

export type MeestGeoDirectories = {
  districtById: Map<string, MeestDistrictRow>;
  regionById: Map<string, MeestRegionRow>;
};
