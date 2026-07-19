import { PublicMeestApi } from '@my-noodles/integration-api-clients/meest';
import { Module } from '@nestjs/common';

import { meestConfig } from './meest.config';
import { MeestService } from './meest.service';

@Module({
  providers: [
    {
      provide: PublicMeestApi,
      useFactory: () => new PublicMeestApi({ apiBaseUrl: meestConfig.apiBaseUrl }),
    },
    MeestService,
  ],
  exports: [MeestService],
})
export class MeestModule {}
