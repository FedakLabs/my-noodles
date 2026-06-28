import { Inject, Injectable } from '@nestjs/common';

import { UkrposhtaService } from '@/infrastructure/external-apis/ukrposhta';

import { DeliveryProvider } from '../../orders/order-delivery.dto';
import type { DeliveryEstimateInput } from '../delivery.types';
import type { DeliveryProviderAdapter } from './delivery-provider.interface';
import { buildStubWarehouses, filterStubCities, getPopularStubCities } from './stub-delivery.data';
import { computeStubEstimate } from './stub-delivery.estimate';

@Injectable()
export class UkrposhtaDeliveryAdapter implements DeliveryProviderAdapter {
  readonly provider = DeliveryProvider.Ukrposhta;

  constructor(@Inject(UkrposhtaService) private readonly ukrposhtaService: UkrposhtaService) {}

  searchCities(query: string) {
    if (this.ukrposhtaService.isConfigured()) {
      return this.ukrposhtaService.searchCities(query);
    }

    return Promise.resolve(filterStubCities(query));
  }

  listPopularCities() {
    if (this.ukrposhtaService.isConfigured()) {
      return this.ukrposhtaService.listPopularCities();
    }

    return Promise.resolve(getPopularStubCities());
  }

  searchWarehouses(cityRef: string, query?: string) {
    if (this.ukrposhtaService.isConfigured()) {
      return this.ukrposhtaService.searchWarehouses(cityRef, query);
    }

    return Promise.resolve(buildStubWarehouses(cityRef, query));
  }

  estimate(input: DeliveryEstimateInput) {
    return Promise.resolve(computeStubEstimate(input));
  }
}
