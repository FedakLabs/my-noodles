import { ExternalApi } from '@my-noodles/api-lib/external-api';
import { APP_LOGGER } from '@my-noodles/api-lib/logging';
import { Inject, Injectable } from '@nestjs/common';
import type { Logger } from 'winston';

import { NovaPoshtaConfig, novaPoshtaConfig } from './nova-poshta.config';

const ADDRESS_GENERAL_MODEL = 'AddressGeneral';

type NovaPoshtaResponse<T> = {
  success: boolean;
  data?: T;
  errors?: string[];
};

export type NovaPoshtaSettlementAddress = {
  Present: string;
  DeliveryCity: string;
};

export type NovaPoshtaSearchSettlementRow = {
  Addresses?: NovaPoshtaSettlementAddress[];
};

export type NovaPoshtaDirectoryCityRow = {
  Ref: string;
  Description: string;
  SettlementTypeDescription?: string;
  RegionsDescription?: string;
  AreaDescription?: string;
};

export type NovaPoshtaWarehouseRow = {
  Ref: string;
  Number: string;
  Description: string;
  ShortAddress?: string;
};

@Injectable()
export class NovaPoshtaApi extends ExternalApi {
  private readonly settings: NovaPoshtaConfig = novaPoshtaConfig;

  constructor(@Inject(APP_LOGGER) logger: Logger) {
    super(logger);
  }

  isConfigured(): boolean {
    return this.settings.isConfigured();
  }

  hasApiKey(): boolean {
    return this.settings.hasApiKey();
  }

  protected getBaseUrl(): string {
    return this.settings.apiBaseUrl;
  }

  /** Company city directory — Ref is valid for getWarehouses CityRef. */
  async getCities(query: string, page = 1, limit = 50): Promise<NovaPoshtaDirectoryCityRow[]> {
    return this.apiRequest<NovaPoshtaDirectoryCityRow[]>(ADDRESS_GENERAL_MODEL, 'getCities', {
      Page: page,
      Limit: limit,
      FindByString: query,
    });
  }

  /** Settlement dictionary search by name fragment. */
  async getSettlements(query: string): Promise<NovaPoshtaDirectoryCityRow[]> {
    return this.apiRequest<NovaPoshtaDirectoryCityRow[]>(ADDRESS_GENERAL_MODEL, 'getSettlements', {
      FindByString: query,
      Limit: 50,
      Page: 1,
    });
  }

  /** Online fuzzy city search — requires a valid apiKey. */
  async searchSettlements(query: string): Promise<NovaPoshtaSearchSettlementRow[]> {
    return this.apiRequest<NovaPoshtaSearchSettlementRow[]>(ADDRESS_GENERAL_MODEL, 'searchSettlements', {
      CityName: query,
      Limit: 50,
      Page: 1,
    });
  }

  async getWarehouses(cityRef: string, query?: string): Promise<NovaPoshtaWarehouseRow[]> {
    return this.apiRequest<NovaPoshtaWarehouseRow[]>(ADDRESS_GENERAL_MODEL, 'getWarehouses', {
      CityRef: cityRef,
      FindByString: query ?? '',
      Limit: 50,
      Page: 1,
      Language: 'UA',
    });
  }

  private async apiRequest<T>(
    modelName: string,
    calledMethod: string,
    methodProperties: Record<string, string | number>,
  ): Promise<T> {
    const payload = {
      apiKey: this.settings.apiKey,
      modelName,
      calledMethod,
      methodProperties: Object.fromEntries(
        Object.entries(methodProperties).map(([key, value]) => [key, String(value)]),
      ),
    };

    const response = await this.post<NovaPoshtaResponse<T>>({
      url: '',
      headers: { 'Content-Type': 'application/json' },
      data: payload,
    });

    if (!response.success) {
      const message = response.errors?.join('; ') ?? 'Nova Poshta API request failed';
      throw new Error(message);
    }

    return response.data ?? ([] as T);
  }
}
