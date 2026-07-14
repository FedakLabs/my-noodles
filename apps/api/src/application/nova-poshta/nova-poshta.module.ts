import { NovaPoshtaApi } from '@my-noodles/api-clients/nova-poshta';
import { APP_LOGGER } from '@my-noodles/api-lib/logging';
import { Module } from '@nestjs/common';
import type { Logger } from 'winston';

import { novaPoshtaConfig } from './nova-poshta.config';
import { NovaPoshtaService } from './nova-poshta.service';

@Module({
  providers: [
    {
      provide: NovaPoshtaApi,
      useFactory: (logger: Logger) =>
        new NovaPoshtaApi(
          { apiBaseUrl: novaPoshtaConfig.apiBaseUrl, apiKey: novaPoshtaConfig.apiKey },
          logger,
        ),
      inject: [APP_LOGGER],
    },
    NovaPoshtaService,
  ],
  exports: [NovaPoshtaService],
})
export class NovaPoshtaModule {}
