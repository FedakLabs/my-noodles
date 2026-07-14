import { Inject, Injectable } from '@nestjs/common';

import { MeestService } from '@/application/meest';

import type { DeliveryMethod } from '../../orders/order-delivery.dto';
import { DeliveryProvider } from '../../orders/order-delivery.dto';
import type { DeliveryEstimateInput } from '../delivery.types';
import type { DeliveryProviderAdapter } from './delivery-provider.interface';
import { computeStubEstimate } from './stub-delivery.estimate';

@Injectable()
export class MeestDeliveryAdapter implements DeliveryProviderAdapter {
  readonly provider = DeliveryProvider.Meest;

  constructor(@Inject(MeestService) private readonly meestService: MeestService) {}

  searchCities(query: string, _method: DeliveryMethod) {
    return this.meestService.searchCities(query);
  }

  searchWarehouses(cityRef: string, query?: string) {
    return this.meestService.searchWarehouses(cityRef, query);
  }

  estimate(input: DeliveryEstimateInput) {
    return Promise.resolve(computeStubEstimate(input));
  }
}
