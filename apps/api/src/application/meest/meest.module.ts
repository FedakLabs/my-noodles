import { MeestApi } from '@my-noodles/api-clients/meest';
import { Module } from '@nestjs/common';

import { meestConfig } from './meest.config';
import { MeestService } from './meest.service';

@Module({
  providers: [
    {
      provide: MeestApi,
      useFactory: () => new MeestApi({ apiBaseUrl: meestConfig.apiBaseUrl }),
    },
    MeestService,
  ],
  exports: [MeestService],
})
export class MeestModule {}
