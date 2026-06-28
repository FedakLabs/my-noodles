import { Inject, Injectable } from '@nestjs/common';

import { MeestService } from '@/infrastructure/external-apis/meest';

import { DeliveryProvider } from '../../orders/order-delivery.dto';
import type { DeliveryEstimateInput } from '../delivery.types';
import type { DeliveryProviderAdapter } from './delivery-provider.interface';
import { buildStubWarehouses, filterStubCities, getPopularStubCities } from './stub-delivery.data';
import { computeStubEstimate } from './stub-delivery.estimate';

@Injectable()
export class MeestDeliveryAdapter implements DeliveryProviderAdapter {
  readonly provider = DeliveryProvider.Meest;

  constructor(@Inject(MeestService) private readonly meestService: MeestService) {}

  searchCities(query: string) {
    if (this.meestService.isConfigured()) {
      return this.meestService.searchCities(query);
    }

    return Promise.resolve(filterStubCities(query));
  }

  listPopularCities() {
    if (this.meestService.isConfigured()) {
      return this.meestService.listPopularCities();
    }

    return Promise.resolve(getPopularStubCities());
  }

  searchWarehouses(cityRef: string, query?: string) {
    if (this.meestService.isConfigured()) {
      return this.meestService.searchWarehouses(cityRef, query);
    }

    return Promise.resolve(buildStubWarehouses(cityRef, query));
  }

  estimate(input: DeliveryEstimateInput) {
    return Promise.resolve(computeStubEstimate(input));
  }
}
