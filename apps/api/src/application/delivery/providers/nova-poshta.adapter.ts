import { Inject, Injectable } from '@nestjs/common';

import { NovaPoshtaService } from '@/application/nova-poshta';

import { DeliveryMethod, DeliveryProvider } from '../../orders/order-delivery.dto';
import type { DeliveryEstimateInput } from '../delivery.types';
import type { DeliveryProviderAdapter } from './delivery-provider.interface';
import { StubDeliveryEstimate, type StubEstimateMethodConfig } from './stub-delivery.estimate';

/**
 * Stub estimate knobs (Ukraine-wide ≤2 kg).
 * Shipping cost is null until real carrier tariffs are wired — storefront shows carrier-rate copy.
 */
const NOVA_POSHTA_ESTIMATE_BY_METHOD: Record<DeliveryMethod, StubEstimateMethodConfig> = {
  [DeliveryMethod.Warehouse]: {
    transitDaysMin: 1,
    transitDaysMax: 2,
    shippingCostMinor: null,
  },
  [DeliveryMethod.Courier]: {
    transitDaysMin: 1,
    transitDaysMax: 2,
    shippingCostMinor: null,
  },
  [DeliveryMethod.Custom]: {
    transitDaysMin: 1,
    transitDaysMax: 2,
    shippingCostMinor: null,
  },
};

@Injectable()
export class NovaPoshtaDeliveryAdapter implements DeliveryProviderAdapter {
  readonly provider = DeliveryProvider.NovaPoshta;

  constructor(
    @Inject(NovaPoshtaService) private readonly novaPoshtaService: NovaPoshtaService,
    @Inject(StubDeliveryEstimate) private readonly stubEstimate: StubDeliveryEstimate,
  ) {}

  searchCities(query: string, method: DeliveryMethod) {
    return this.novaPoshtaService.searchCities(query, method);
  }

  searchWarehouses(cityRef: string, query?: string) {
    return this.novaPoshtaService.searchWarehouses(cityRef, query);
  }

  estimate(input: DeliveryEstimateInput) {
    return this.stubEstimate.estimate(input, NOVA_POSHTA_ESTIMATE_BY_METHOD);
  }
}
