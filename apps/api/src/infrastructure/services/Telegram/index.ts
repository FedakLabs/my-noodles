export { TelegramService } from './client';
export {
  isTelegramConfigured,
  resolveTelegramBaseUrl,
  TELEGRAM_API_ORIGIN,
  type TelegramConfig,
  telegramConfig,
} from './telegram.config';
export type { OrderTelegramLine, OrderTelegramPayload } from './telegram.dto';
export { TelegramModule } from './telegram.module';
