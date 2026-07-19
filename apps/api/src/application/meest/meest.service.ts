import {
  APP_LOCALE_TO_MEEST_LOCALE,
  MeestApi,
  type MeestBranchRow,
  type MeestLocalizedName,
  type MeestLocalityData,
} from '@my-noodles/api-clients/meest';
import { LocaleContext } from '@my-noodles/api-lib/locale';
import { Inject, Injectable } from '@nestjs/common';

import type { DeliveryCity, DeliveryWarehouse } from '@/application/delivery/delivery.types';

@Injectable()
export class MeestService {
  constructor(@Inject(MeestApi) private readonly meestApi: MeestApi) {}

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
        name: this.formatCityName(locality),
      }));
  }

  async searchWarehouses(cityRef: string, query?: string): Promise<DeliveryWarehouse[]> {
    const branches = await this.meestApi.getBranches(cityRef);
    const normalizedQuery = query?.trim().toLowerCase();

    return branches
      .filter((branch) => this.matchesWarehouseQuery(branch, normalizedQuery))
      .map((branch) => ({
        ref: branch.br_id,
        number: String(branch.num_showcase ?? ''),
        name: this.formatWarehouseName(branch),
        address: this.formatWarehouseAddress(branch),
      }));
  }

  private formatCityName(locality: MeestLocalityData): string {
    // geo_localities has no lang filter / English name; keep Ukrainian primary fields.
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

  private formatWarehouseName(branch: MeestBranchRow): string {
    const type = this.pickLocalized(branch.type_public);
    const number = branch.num_showcase;
    const city = this.pickLocalized(branch.city);

    if (type && number) {
      return city ? `${type} №${number}, ${city}` : `${type} №${number}`;
    }

    return city ?? type ?? branch.br_id;
  }

  private formatWarehouseAddress(branch: MeestBranchRow): string | undefined {
    const street = this.pickLocalized(branch.street);
    const streetNumber = branch.street_number?.trim();
    const city = this.pickLocalized(branch.city);
    const zip = branch.zip?.trim();

    const streetLine = street ? (streetNumber ? `${street}, ${streetNumber}` : street) : undefined;

    if (streetLine && city) {
      return zip ? `${streetLine}, ${city}, ${zip}` : `${streetLine}, ${city}`;
    }

    return streetLine ?? city ?? undefined;
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
      branch.num_showcase,
      this.pickLocalized(branch.type_public),
      this.pickLocalized(branch.city),
      this.pickLocalized(branch.street),
      branch.street_number,
      branch.zip,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  }
}
