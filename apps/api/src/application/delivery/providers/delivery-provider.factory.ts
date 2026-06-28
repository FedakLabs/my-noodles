import { Inject, Injectable } from '@nestjs/common';

import { DeliveryProvider } from '../../orders/order-delivery.dto';
import { InvalidDeliveryProviderException } from '../delivery.exceptions';
import type { DeliveryProviderAdapter } from './delivery-provider.interface';
import { MeestDeliveryAdapter } from './meest.adapter';
import { NovaPoshtaDeliveryAdapter } from './nova-poshta.adapter';
import { UkrposhtaDeliveryAdapter } from './ukrposhta.adapter';

@Injectable()
export class DeliveryProviderFactory {
  private readonly adapters: Map<DeliveryProvider, DeliveryProviderAdapter>;

  constructor(
    @Inject(NovaPoshtaDeliveryAdapter) novaPoshta: NovaPoshtaDeliveryAdapter,
    @Inject(MeestDeliveryAdapter) meest: MeestDeliveryAdapter,
    @Inject(UkrposhtaDeliveryAdapter) ukrposhta: UkrposhtaDeliveryAdapter,
  ) {
    this.adapters = new Map<DeliveryProvider, DeliveryProviderAdapter>([
      [DeliveryProvider.NovaPoshta, novaPoshta],
      [DeliveryProvider.Meest, meest],
      [DeliveryProvider.Ukrposhta, ukrposhta],
    ]);
  }

  get(provider: DeliveryProvider): DeliveryProviderAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) {
      throw new InvalidDeliveryProviderException(provider);
    }

    return adapter;
  }

  list(): DeliveryProviderAdapter[] {
    return [...this.adapters.values()];
  }
}
