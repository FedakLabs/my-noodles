import { Module } from '@nestjs/common';

import { TelegramApi } from './telegram.api';
import { TelegramService } from './telegram.service';

@Module({
  providers: [TelegramApi, TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
