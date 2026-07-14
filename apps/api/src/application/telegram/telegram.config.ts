import { IsDefined, IsString, IsUrl, MinLength } from 'class-validator';

import { config } from '@/config';

export class TelegramConfig {
  @IsDefined()
  @IsUrl({ require_tld: false })
  apiBaseUrl = 'https://api.telegram.org';

  @IsDefined()
  @IsString()
  @MinLength(1)
  botToken = process.env.TELEGRAM_BOT_TOKEN;

  @IsDefined()
  @IsString()
  @MinLength(1)
  chatId = process.env.TELEGRAM_CHAT_ID;
}

export const telegramConfig = config.validate(new TelegramConfig(), 'Telegram configuration');
