import { UkrposhtaApi } from '@my-noodles/api-clients/ukrposhta';
import { Module } from '@nestjs/common';

import { ukrposhtaConfig } from './ukrposhta.config';
import { UkrposhtaService } from './ukrposhta.service';

@Module({
  providers: [
    {
      provide: UkrposhtaApi,
      useFactory: () =>
        new UkrposhtaApi({ apiBaseUrl: ukrposhtaConfig.apiBaseUrl, apiKey: ukrposhtaConfig.apiKey }),
    },
    UkrposhtaService,
  ],
  exports: [UkrposhtaService],
})
export class UkrposhtaModule {}
