import { UkrposhtaApi } from '@my-noodles/api-clients/ukrposhta';
import { APP_LOGGER } from '@my-noodles/api-lib/logging';
import { Module } from '@nestjs/common';
import type { Logger } from 'winston';

import { ukrposhtaConfig } from './ukrposhta.config';
import { UkrposhtaService } from './ukrposhta.service';

@Module({
  providers: [
    {
      provide: UkrposhtaApi,
      useFactory: (logger: Logger) =>
        new UkrposhtaApi({ apiBaseUrl: ukrposhtaConfig.apiBaseUrl, apiKey: ukrposhtaConfig.apiKey }, logger),
      inject: [APP_LOGGER],
    },
    UkrposhtaService,
  ],
  exports: [UkrposhtaService],
})
export class UkrposhtaModule {}
