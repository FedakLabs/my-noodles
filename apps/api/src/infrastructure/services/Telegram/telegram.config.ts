import { IsDefined, IsString, MinLength } from 'class-validator';

import { config } from '@/config';

export const TELEGRAM_API_ORIGIN = 'https://api.telegram.org';

export class TelegramConfig {
  @IsDefined()
  @IsString()
  @MinLength(1)
  botToken!: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  chatId!: string;
}

export const telegramConfig = config.validate(
  TelegramConfig,
  {
    botToken: process.env.TELEGRAM_BOT_TOKEN,
    chatId: process.env.TELEGRAM_CHAT_ID,
  },
  'Telegram configuration',
);
