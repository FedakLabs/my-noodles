import { ApiClient } from '@my-noodles/api-lib/api-client';
import type { Logger } from 'winston';

export type TelegramClientOptions = {
  apiBaseUrl: string;
  botToken: string;
};

type SendMessageParams = {
  chatId: string;
  text: string;
  parseMode?: 'HTML';
  disableWebPagePreview?: boolean;
};

export class TelegramApi extends ApiClient {
  constructor(
    private readonly settings: TelegramClientOptions,
    logger: Logger,
  ) {
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
