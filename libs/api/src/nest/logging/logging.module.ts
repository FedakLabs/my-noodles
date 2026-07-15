import { DynamicModule, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import type { Logger } from 'winston';

import { APP_LOGGER } from '../../logging';
import { HTTP_LOG_METADATA, type HttpLogMetadata } from './http-log-metadata';
import { LoggingInterceptor } from './logging.interceptor';

export type LoggingModuleOptions = HttpLogMetadata & {
  logger: Logger;
};

@Module({})
export class LoggingModule {
  static forRoot(options: LoggingModuleOptions): DynamicModule {
    const metadata: HttpLogMetadata = {
      appName: options.appName,
      appVersion: options.appVersion,
    };

    return {
      module: LoggingModule,
      global: true,
      providers: [
        {
          provide: APP_LOGGER,
          useValue: options.logger,
        },
        {
          provide: HTTP_LOG_METADATA,
          useValue: metadata,
        },
        LoggingInterceptor,
        {
          provide: APP_INTERCEPTOR,
          useExisting: LoggingInterceptor,
        },
      ],
      exports: [APP_LOGGER],
    };
  }
}
