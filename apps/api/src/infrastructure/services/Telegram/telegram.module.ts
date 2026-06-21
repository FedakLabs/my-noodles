import { Module } from '@nestjs/common';

import { TelegramService } from './client';

@Module({
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
