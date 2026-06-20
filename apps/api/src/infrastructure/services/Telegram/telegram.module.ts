import { Module } from '@nestjs/common';

import { TelegramService } from './client';
import { telegramConfig } from './telegram.config';

@Module({
  providers: [
    {
      provide: TelegramService,
      useFactory: () => new TelegramService(telegramConfig),
    },
  ],
  exports: [TelegramService],
})
export class TelegramModule {}
