import {
  UkrposhtaApi,
  type UkrposhtaCityRow,
  type UkrposhtaPostOfficeRow,
} from '@my-noodles/api-clients/ukrposhta';
import { LocaleContext } from '@my-noodles/api-lib/locale';
import { Inject, Injectable } from '@nestjs/common';

import type { DeliveryCity, DeliveryWarehouse } from '@/application/delivery/delivery.types';

@Injectable()
export class UkrposhtaService {
  constructor(@Inject(UkrposhtaApi) private readonly ukrposhtaApi: UkrposhtaApi) {}

  async searchCities(query: string): Promise<DeliveryCity[]> {
    const cities = await this.ukrposhtaApi.searchCities({ cityUa: query });
    const seen = new Set<string>();

    return cities
      .filter((city) => {
        const ref = String(city.CITY_ID);

        if (seen.has(ref)) {
          return false;
        }

        seen.add(ref);
        return true;
      })
      .map((city) => ({
        ref: String(city.CITY_ID),
        name: formatUkrposhtaCityName(city),
      }));
  }

  async searchWarehouses(cityRef: string, query?: string): Promise<DeliveryWarehouse[]> {
    const offices = await this.ukrposhtaApi.getPostOffices({ cityId: cityRef });
    const normalizedQuery = query?.trim().toLowerCase();

    return offices
      .filter((office) => matchesUkrposhtaWarehouseQuery(office, normalizedQuery))
      .map((office) => ({
        ref: String(office.POSTOFFICE_ID),
        number: extractUkrposhtaWarehouseNumber(office),
        name: office.POSTOFFICE_UA?.trim() || String(office.POSTOFFICE_ID),
        address: formatUkrposhtaWarehouseAddress(office),
      }));
  }
}

export function formatUkrposhtaCityName(city: UkrposhtaCityRow): string {
  const preferEn = LocaleContext.get() === 'en';
  const type = city.SHORTCITYTYPE_UA?.trim();
  const name = (preferEn ? city.CITY_EN : city.CITY_UA)?.trim() || city.CITY_UA.trim();
  const region = (preferEn ? city.REGION_EN : city.REGION_UA)?.trim() || city.REGION_UA?.trim();
  const district = (preferEn ? city.DISTRICT_EN : city.DISTRICT_UA)?.trim() || city.DISTRICT_UA?.trim();
  const cityLabel = type ? `${type} ${name}` : name;

  if (region && district && district !== region) {
    return `${cityLabel}, ${district}, ${region}`;
  }

  if (region) {
    return `${cityLabel}, ${region}`;
  }

  return cityLabel;
}

export function extractUkrposhtaWarehouseNumber(office: UkrposhtaPostOfficeRow): string {
  return String(office.POSTCODE ?? office.POSTOFFICE_ID);
}

export function formatUkrposhtaWarehouseAddress(office: UkrposhtaPostOfficeRow): string | undefined {
  const street = office.STREET_UA_VPZ?.trim();
  const house = office.HOUSENUMBER != null ? String(office.HOUSENUMBER).trim() : '';

  if (street && house) {
    return `${street}, ${house}`;
  }

  return street || undefined;
}

function matchesUkrposhtaWarehouseQuery(office: UkrposhtaPostOfficeRow, query?: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = [
    office.POSTOFFICE_UA,
    office.POSTCODE,
    office.STREET_UA_VPZ,
    office.HOUSENUMBER,
    office.TYPE_LONG,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}
