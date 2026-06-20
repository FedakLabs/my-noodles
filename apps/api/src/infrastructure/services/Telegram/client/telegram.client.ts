import { Injectable } from '@nestjs/common';

import { ExternalApi } from '@/infrastructure/external-api';

import { isTelegramConfigured, resolveTelegramBaseUrl, type TelegramConfig } from '../telegram.config';
import type { OrderTelegramPayload } from '../telegram.dto';

function formatMinor(amountMinor: number, currency: string): string {
  const major = (amountMinor / 100).toFixed(2);
  return `${major} ${currency}`;
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

@Injectable()
export class TelegramService extends ExternalApi {
  constructor(private readonly settings: TelegramConfig) {
    super(TelegramService.name);
  }

  protected getBaseUrl(): string {
    return resolveTelegramBaseUrl(this.settings);
  }

  isConfigured(): boolean {
    return isTelegramConfigured(this.settings);
  }

  async sendOrderNotification(payload: OrderTelegramPayload): Promise<void> {
    if (!this.isConfigured()) {
      return;
    }

    const lines = payload.lines
      .map(
        (line) =>
          `• ${escapeHtml(line.title)} × ${line.qty} — ${formatMinor(line.lineTotalMinor, payload.currency)}`,
      )
      .join('\n');

    const text = [
      `<b>Нове замовлення #${escapeHtml(payload.orderId.slice(0, 8))}</b>`,
      `<i>${payload.createdAt.toISOString()}</i>`,
      '',
      `<b>Клієнт:</b> ${escapeHtml(payload.customerName)}`,
      `<b>Телефон:</b> <a href="tel:${escapeHtml(payload.phone)}">${escapeHtml(payload.phone)}</a>`,
      `<b>Доставка:</b>\n${escapeHtml(payload.deliverySummary)}`,
      '',
      '<b>Товари:</b>',
      lines,
      '',
      `<b>Разом:</b> ${formatMinor(payload.totalMinor, payload.currency)}`,
    ].join('\n');

    await this.post<void>({
      url: '/sendMessage',
      headers: { 'Content-Type': 'application/json' },
      data: {
        chat_id: this.settings.chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      },
    });
  }
}
