import { Inject, Injectable } from '@nestjs/common';

import { UkrposhtaService } from '@/application/ukrposhta';

import type { DeliveryMethod } from '../../orders/order-delivery.dto';
import { DeliveryProvider } from '../../orders/order-delivery.dto';
import type { DeliveryEstimateInput } from '../delivery.types';
import type { DeliveryProviderAdapter } from './delivery-provider.interface';
import { computeStubEstimate } from './stub-delivery.estimate';

@Injectable()
export class UkrposhtaDeliveryAdapter implements DeliveryProviderAdapter {
  readonly provider = DeliveryProvider.Ukrposhta;

  constructor(@Inject(UkrposhtaService) private readonly ukrposhtaService: UkrposhtaService) {}

  searchCities(query: string, _method: DeliveryMethod) {
    return this.ukrposhtaService.searchCities(query);
  }

  searchWarehouses(cityRef: string, query?: string) {
    return this.ukrposhtaService.searchWarehouses(cityRef, query);
  }

  estimate(input: DeliveryEstimateInput) {
    return Promise.resolve(computeStubEstimate(input));
  }
}
