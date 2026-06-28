import { Inject, Injectable } from '@nestjs/common';

import { NovaPoshtaService } from '@/infrastructure/external-apis/nova-poshta';

import { DeliveryProvider } from '../../orders/order-delivery.dto';
import type { DeliveryEstimateInput } from '../delivery.types';
import type { DeliveryProviderAdapter } from './delivery-provider.interface';
import { buildStubWarehouses, filterStubCities, getPopularStubCities } from './stub-delivery.data';
import { computeStubEstimate } from './stub-delivery.estimate';

@Injectable()
export class NovaPoshtaDeliveryAdapter implements DeliveryProviderAdapter {
  readonly provider = DeliveryProvider.NovaPoshta;

  constructor(@Inject(NovaPoshtaService) private readonly novaPoshtaService: NovaPoshtaService) {}

  searchCities(query: string) {
    if (!this.novaPoshtaService.isConfigured()) {
      return Promise.resolve(filterStubCities(query));
    }

    return this.novaPoshtaService.searchCities(query);
  }

  listPopularCities() {
    if (!this.novaPoshtaService.isConfigured()) {
      return Promise.resolve(getPopularStubCities());
    }

    return this.novaPoshtaService.listPopularCities();
  }

  searchWarehouses(cityRef: string, query?: string) {
    if (!this.novaPoshtaService.isConfigured()) {
      return Promise.resolve(buildStubWarehouses(cityRef, query));
    }

    return this.novaPoshtaService.searchWarehouses(cityRef, query);
  }

  estimate(input: DeliveryEstimateInput) {
    return Promise.resolve(computeStubEstimate(input));
  }
}
