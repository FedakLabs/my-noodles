import { Inject, Injectable } from '@nestjs/common';

import { UkrposhtaService } from '@/application/ukrposhta';

import { DeliveryMethod, DeliveryProvider } from '../../orders/order-delivery.dto';
import type { DeliveryEstimateInput } from '../delivery.types';
import type { DeliveryProviderAdapter } from './delivery-provider.interface';
import { StubDeliveryEstimate, type StubEstimateMethodConfig } from './stub-delivery.estimate';

/**
 * Stub estimate knobs (Ukraine-wide small parcel).
 * Source: Укрпошта Пріоритетний / дрібний по Україні 65 ₴.
 * Storefront exposes Custom only; Warehouse/Courier mirror Custom for lookup safety.
 */
const UKRPOSHTA_ESTIMATE_BY_METHOD: Record<DeliveryMethod, StubEstimateMethodConfig> = {
  [DeliveryMethod.Warehouse]: {
    transitDaysMin: 2,
    transitDaysMax: 4,
    shippingCostMinor: 6_500,
  },
  [DeliveryMethod.Courier]: {
    transitDaysMin: 2,
    transitDaysMax: 4,
    shippingCostMinor: 6_500,
  },
  [DeliveryMethod.Custom]: {
    transitDaysMin: 2,
    transitDaysMax: 4,
    shippingCostMinor: 6_500,
  },
};

@Injectable()
export class UkrposhtaDeliveryAdapter implements DeliveryProviderAdapter {
  readonly provider = DeliveryProvider.Ukrposhta;

  constructor(
    @Inject(UkrposhtaService) private readonly ukrposhtaService: UkrposhtaService,
    @Inject(StubDeliveryEstimate) private readonly stubEstimate: StubDeliveryEstimate,
  ) {}

  searchCities(query: string, _method: DeliveryMethod) {
    return this.ukrposhtaService.searchCities(query);
  }

  searchWarehouses(cityRef: string, query?: string) {
    return this.ukrposhtaService.searchWarehouses(cityRef, query);
  }

  estimate(input: DeliveryEstimateInput) {
    return this.stubEstimate.estimate(input, UKRPOSHTA_ESTIMATE_BY_METHOD);
  }
}
