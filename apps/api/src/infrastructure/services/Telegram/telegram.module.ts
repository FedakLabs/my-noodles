import { Module } from '@nestjs/common';

import { config } from '@/config';

import { TelegramClient } from './client/telegram.client';

@Module({
  providers: [
    {
      provide: TelegramClient,
      useFactory: () => new TelegramClient(config.telegram),
    },
  ],
  exports: [TelegramClient],
})
export class TelegramModule {}
