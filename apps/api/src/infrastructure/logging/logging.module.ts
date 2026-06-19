import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { HttpAccessLogInterceptor } from './http-access-log.interceptor';

@Module({
  providers: [
    HttpAccessLogInterceptor,
    {
      provide: APP_INTERCEPTOR,
      useExisting: HttpAccessLogInterceptor,
    },
  ],
})
export class LoggingModule {}
