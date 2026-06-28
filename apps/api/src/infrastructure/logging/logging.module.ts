import { APP_LOGGER, WinstonLoggerFactory } from '@my-noodles/api-lib/logging';
import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { config } from '@/config';

import { HttpAccessLogInterceptor } from './http-access-log.interceptor';

@Global()
@Module({
  providers: [
    {
      provide: APP_LOGGER,
      useFactory: () =>
        new WinstonLoggerFactory({
          appName: config.appName,
          nodeEnv: config.nodeEnv,
          otel: config.otel,
        }).createLogger(),
    },
    HttpAccessLogInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: HttpAccessLogInterceptor,
    },
  ],
  exports: [APP_LOGGER],
})
export class LoggingModule {}
