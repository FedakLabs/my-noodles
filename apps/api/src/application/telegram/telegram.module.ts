import { TelegramApi } from '@my-noodles/integration-api-clients/telegram';
import { Module } from '@nestjs/common';

import { telegramConfig } from './telegram.config';
import { TelegramService } from './telegram.service';

@Module({
  providers: [
    {
      provide: TelegramApi,
      useFactory: () =>
        new TelegramApi({ apiBaseUrl: telegramConfig.apiBaseUrl, botToken: telegramConfig.botToken }),
    },
    TelegramService,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}
