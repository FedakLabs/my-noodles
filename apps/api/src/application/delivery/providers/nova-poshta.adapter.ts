import { Inject, Injectable } from '@nestjs/common';

import { NovaPoshtaService } from '@/application/nova-poshta';

import { DeliveryMethod, DeliveryProvider } from '../../orders/order-delivery.dto';
import type { DeliveryEstimateInput } from '../delivery.types';
import type { DeliveryProviderAdapter } from './delivery-provider.interface';
import { computeStubEstimate } from './stub-delivery.estimate';

@Injectable()
export class NovaPoshtaDeliveryAdapter implements DeliveryProviderAdapter {
  readonly provider = DeliveryProvider.NovaPoshta;

  constructor(@Inject(NovaPoshtaService) private readonly novaPoshtaService: NovaPoshtaService) {}

  searchCities(query: string, method: DeliveryMethod) {
    return this.novaPoshtaService.searchCities(query, method);
  }

  searchWarehouses(cityRef: string, query?: string) {
    return this.novaPoshtaService.searchWarehouses(cityRef, query);
  }

  estimate(input: DeliveryEstimateInput) {
    return Promise.resolve(computeStubEstimate(input));
  }
}
