import { readConfigEnvironment } from '@my-noodles/api-lib/config';

export const TELEGRAM_API_ORIGIN = 'https://api.telegram.org';

export type TelegramConfig = {
  botToken: string;
  chatId: string;
};

export const telegramConfig: TelegramConfig = {
  botToken: readConfigEnvironment(process.env).TELEGRAM_BOT_TOKEN ?? '',
  chatId: readConfigEnvironment(process.env).TELEGRAM_CHAT_ID ?? '',
};

export function resolveTelegramBaseUrl(config: TelegramConfig): string {
  return config.botToken ? `${TELEGRAM_API_ORIGIN}/bot${config.botToken}` : TELEGRAM_API_ORIGIN;
}

export function isTelegramConfigured(config: TelegramConfig): boolean {
  return Boolean(config.botToken && config.chatId);
}
