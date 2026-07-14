import { APP_LOGGER, createAppLogger } from '@my-noodles/api-lib/logging';
import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { config } from '@/config';

import { LoggingInterceptor } from './logging.interceptor';

export const appLogger = createAppLogger({
  appName: config.appName,
  nodeEnv: config.nodeEnv,
  otel: config.otel,
});

@Global()
@Module({
  providers: [
    {
      provide: APP_LOGGER,
      useValue: appLogger,
    },
    LoggingInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: LoggingInterceptor,
    },
  ],
  exports: [APP_LOGGER],
})
export class LoggingModule {}
