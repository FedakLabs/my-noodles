import { TelegramApi } from '@my-noodles/api-clients/telegram';
import { APP_LOGGER } from '@my-noodles/api-lib/logging';
import { Module } from '@nestjs/common';
import type { Logger } from 'winston';

import { telegramConfig } from './telegram.config';
import { TelegramService } from './telegram.service';

@Module({
  providers: [
    {
      provide: TelegramApi,
      useFactory: (logger: Logger) =>
        new TelegramApi({ apiBaseUrl: telegramConfig.apiBaseUrl, botToken: telegramConfig.botToken }, logger),
      inject: [APP_LOGGER],
    },
    TelegramService,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}
