import { ExternalApi } from '@my-noodles/api-lib/external-api';
import { APP_LOGGER } from '@my-noodles/api-lib/logging';
import { Inject, Injectable } from '@nestjs/common';
import type { Logger } from 'winston';

import { TelegramConfig, telegramConfig } from './telegram.config';

type SendMessageParams = {
  chatId: string;
  text: string;
  parseMode?: 'HTML';
  disableWebPagePreview?: boolean;
};

@Injectable()
export class TelegramApi extends ExternalApi {
  private readonly settings: TelegramConfig = telegramConfig;

  constructor(@Inject(APP_LOGGER) logger: Logger) {
    super(logger);
  }

  protected getBaseUrl(): string {
    return `${this.settings.apiBaseUrl}/bot${this.settings.botToken}`;
  }

  async sendMessage(params: SendMessageParams): Promise<void> {
    await this.post<void>({
      url: '/sendMessage',
      headers: { 'Content-Type': 'application/json' },
      data: {
        chat_id: params.chatId,
        text: params.text,
        parse_mode: params.parseMode,
        disable_web_page_preview: params.disableWebPagePreview,
      },
    });
  }
}
