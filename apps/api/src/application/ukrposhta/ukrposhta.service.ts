import {
  UkrposhtaApi,
  type UkrposhtaCityRow,
  type UkrposhtaPostOfficeRow,
} from '@my-noodles/api-clients/ukrposhta';
import { Inject, Injectable } from '@nestjs/common';

import type { DeliveryCity, DeliveryWarehouse } from '@/application/delivery/delivery.types';

@Injectable()
export class UkrposhtaService {
  constructor(@Inject(UkrposhtaApi) private readonly ukrposhtaApi: UkrposhtaApi) {}

  async searchCities(query: string): Promise<DeliveryCity[]> {
    const cities = await this.ukrposhtaApi.searchCities(query);
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
    const offices = await this.ukrposhtaApi.getPostOffices(cityRef);
    const normalizedQuery = query?.trim().toLowerCase();

    return offices
      .filter((office) => matchesUkrposhtaWarehouseQuery(office, normalizedQuery))
      .map((office) => ({
        ref: String(office.ID),
        number: extractUkrposhtaWarehouseNumber(office),
        name: office.PO_LONG?.trim() || office.PO_SHORT?.trim() || String(office.ID),
        address: office.ADDRESS?.trim() || undefined,
      }));
  }
}

export function formatUkrposhtaCityName(city: UkrposhtaCityRow): string {
  const type = city.SHORTCITYTYPE_UA?.trim();
  const name = city.CITY_UA.trim();
  const region = city.REGION_UA?.trim();
  const district = city.DISTRICT_UA?.trim();
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
  const shortName = office.PO_SHORT?.trim();

  if (shortName) {
    const match = shortName.match(/(\d+)/);
    if (match?.[1]) {
      return match[1];
    }
  }

  return String(office.POSTINDEX ?? office.ID);
}

function matchesUkrposhtaWarehouseQuery(office: UkrposhtaPostOfficeRow, query?: string): boolean {
  if (!query) {
    return true;
  }

  const haystack = [office.PO_SHORT, office.PO_LONG, office.POSTINDEX, office.ADDRESS]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(query);
}
