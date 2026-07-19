import { NovaPoshtaApi } from '@my-noodles/integration-api-clients/nova-poshta';
import { Module } from '@nestjs/common';

import { novaPoshtaConfig } from './nova-poshta.config';
import { NovaPoshtaService } from './nova-poshta.service';

@Module({
  providers: [
    {
      provide: NovaPoshtaApi,
      useFactory: () =>
        new NovaPoshtaApi({
          apiBaseUrl: novaPoshtaConfig.apiBaseUrl,
          apiKey: novaPoshtaConfig.apiKey,
        }),
    },
    NovaPoshtaService,
  ],
  exports: [NovaPoshtaService],
})
export class NovaPoshtaModule {}
