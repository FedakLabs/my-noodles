import { Module } from '@nestjs/common';

import { MeestModule } from '@/application/meest';
import { NovaPoshtaModule } from '@/application/nova-poshta';
import { UkrposhtaModule } from '@/application/ukrposhta';

import { DeliveryCatalogCache } from './delivery-catalog.cache';
import { DeliveryMethodsService } from './delivery-methods.service';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryProviderFactory } from './providers/delivery-provider.factory';
import { MeestDeliveryAdapter } from './providers/meest.adapter';
import { NovaPoshtaDeliveryAdapter } from './providers/nova-poshta.adapter';
import { StubDeliveryEstimate } from './providers/stub-delivery.estimate';
import { UkrposhtaDeliveryAdapter } from './providers/ukrposhta.adapter';

@Module({
  imports: [NovaPoshtaModule, MeestModule, UkrposhtaModule],
  controllers: [DeliveryController],
  providers: [
    DeliveryService,
    DeliveryMethodsService,
    DeliveryCatalogCache,
    DeliveryProviderFactory,
    StubDeliveryEstimate,
    NovaPoshtaDeliveryAdapter,
    MeestDeliveryAdapter,
    UkrposhtaDeliveryAdapter,
  ],
  exports: [DeliveryService, DeliveryMethodsService],
})
export class DeliveryModule {}
