import { Injectable } from '@nestjs/common';

import type { OrderTelegramPayload, TelegramSettings } from './telegram.types';

function formatMinor(amountMinor: number, currency: string): string {
  const major = (amountMinor / 100).toFixed(2);
  return `${major} ${currency}`;
}

function escapeHtml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
}

@Injectable()
export class TelegramClient {
  constructor(private readonly settings: TelegramSettings) {}

  isConfigured(): boolean {
    return Boolean(this.settings.botToken && this.settings.chatId);
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

    const response = await fetch(`https://api.telegram.org/bot${this.settings.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: this.settings.chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Telegram API error ${response.status}: ${body}`);
    }
  }
}
