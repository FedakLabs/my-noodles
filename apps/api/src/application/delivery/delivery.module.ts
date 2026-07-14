import { Module } from '@nestjs/common';

import { MeestModule } from '@/application/meest';
import { NovaPoshtaModule } from '@/application/nova-poshta';
import { UkrposhtaModule } from '@/application/ukrposhta';

import { DeliveryCatalogCache } from './delivery-catalog.cache';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { DeliveryProviderFactory } from './providers/delivery-provider.factory';
import { MeestDeliveryAdapter } from './providers/meest.adapter';
import { NovaPoshtaDeliveryAdapter } from './providers/nova-poshta.adapter';
import { UkrposhtaDeliveryAdapter } from './providers/ukrposhta.adapter';

@Module({
  imports: [NovaPoshtaModule, MeestModule, UkrposhtaModule],
  controllers: [DeliveryController],
  providers: [
    DeliveryService,
    DeliveryCatalogCache,
    DeliveryProviderFactory,
    NovaPoshtaDeliveryAdapter,
    MeestDeliveryAdapter,
    UkrposhtaDeliveryAdapter,
  ],
  exports: [DeliveryService],
})
export class DeliveryModule {}
