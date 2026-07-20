import { ApiClient, ApiClientException } from '@my-noodles/api-lib/api-client';

import { NOVA_POSHTA_ADDRESS_GENERAL_MODEL, NOVA_POSHTA_ADDRESS_MODEL } from './nova-poshta.api.config';
import type {
  NovaPoshtaClientOptions,
  NovaPoshtaDirectoryCityRow,
  NovaPoshtaResponse,
  NovaPoshtaSearchSettlementRow,
  NovaPoshtaWarehouseRow,
} from './nova-poshta.api.dto';

export type {
  NovaPoshtaClientOptions,
  NovaPoshtaDirectoryCityRow,
  NovaPoshtaResponse,
  NovaPoshtaSearchSettlementRow,
  NovaPoshtaSettlementAddress,
  NovaPoshtaWarehouseRow,
} from './nova-poshta.api.dto';

export class NovaPoshtaApi extends ApiClient {
  constructor(private readonly settings: NovaPoshtaClientOptions) {
    super();
  }

  protected getBaseUrl(): string {
    return this.settings.apiBaseUrl;
  }

  protected override assertResponseOk(body: NovaPoshtaResponse, status: number): void {
    if (body.success) {
      return;
    }

    const message = body.errors?.join('; ') ?? 'Nova Poshta API request failed';
    throw new ApiClientException({ message, status, internal: body });
  }

  async getCities(query: string, page = 1, limit = 50): Promise<NovaPoshtaDirectoryCityRow[]> {
    return await this.apiRequest<NovaPoshtaDirectoryCityRow[]>(NOVA_POSHTA_ADDRESS_MODEL, 'getCities', {
      Page: page,
      Limit: limit,
      FindByString: query,
    });
  }

  async searchSettlements(query: string): Promise<NovaPoshtaSearchSettlementRow[]> {
    return await this.apiRequest<NovaPoshtaSearchSettlementRow[]>(
      NOVA_POSHTA_ADDRESS_GENERAL_MODEL,
      'searchSettlements',
      {
        CityName: query,
        Limit: 50,
        Page: 1,
      },
    );
  }

  async getWarehouses(cityRef: string, query?: string): Promise<NovaPoshtaWarehouseRow[]> {
    return await this.apiRequest<NovaPoshtaWarehouseRow[]>(
      NOVA_POSHTA_ADDRESS_GENERAL_MODEL,
      'getWarehouses',
      {
        CityRef: cityRef,
        FindByString: query ?? '',
        Limit: 50,
        Page: 1,
        Language: 'UA',
      },
    );
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
      operation: calledMethod,
      headers: { 'Content-Type': 'application/json' },
      data: payload,
    });

    return response.data ?? ([] as T);
  }
}
