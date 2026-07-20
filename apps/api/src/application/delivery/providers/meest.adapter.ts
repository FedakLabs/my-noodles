import { Inject, Injectable } from '@nestjs/common';

import { MeestService } from '@/application/meest';

import { DeliveryMethod, DeliveryProvider } from '../../orders/order-delivery.dto';
import type { DeliveryEstimateInput } from '../delivery.types';
import type { DeliveryProviderAdapter } from './delivery-provider.interface';
import { StubDeliveryEstimate, type StubEstimateMethodConfig } from './stub-delivery.estimate';

/**
 * Stub estimate knobs (Ukraine-wide ≤2 kg).
 * Source: Meest intercity ≤2 кг 70 ₴ from 01.03.2026; кур’єр +50 ₴.
 */
const MEEST_ESTIMATE_BY_METHOD: Record<DeliveryMethod, StubEstimateMethodConfig> = {
  [DeliveryMethod.Warehouse]: {
    transitDaysMin: 1,
    transitDaysMax: 2,
    shippingCostMinor: 7_000,
  },
  [DeliveryMethod.Courier]: {
    transitDaysMin: 1,
    transitDaysMax: 2,
    shippingCostMinor: 12_000,
  },
  [DeliveryMethod.Custom]: {
    transitDaysMin: 1,
    transitDaysMax: 2,
    shippingCostMinor: 7_000,
  },
};

@Injectable()
export class MeestDeliveryAdapter implements DeliveryProviderAdapter {
  readonly provider = DeliveryProvider.Meest;

  constructor(
    @Inject(MeestService) private readonly meestService: MeestService,
    @Inject(StubDeliveryEstimate) private readonly stubEstimate: StubDeliveryEstimate,
  ) {}

  searchCities(query: string, _method: DeliveryMethod) {
    return this.meestService.searchCities(query);
  }

  searchWarehouses(cityRef: string, query?: string) {
    return this.meestService.searchWarehouses(cityRef, query);
  }

  estimate(input: DeliveryEstimateInput) {
    return this.stubEstimate.estimate(input, MEEST_ESTIMATE_BY_METHOD);
  }
}
