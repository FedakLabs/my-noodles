import { MeestApi } from '@my-noodles/api-clients/meest';
import { APP_LOGGER } from '@my-noodles/api-lib/logging';
import { Module } from '@nestjs/common';
import type { Logger } from 'winston';

import { meestConfig } from './meest.config';
import { MeestService } from './meest.service';

@Module({
  providers: [
    {
      provide: MeestApi,
      useFactory: (logger: Logger) => new MeestApi({ apiBaseUrl: meestConfig.apiBaseUrl }, logger),
      inject: [APP_LOGGER],
    },
    MeestService,
  ],
  exports: [MeestService],
})
export class MeestModule {}
