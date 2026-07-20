import { logger } from '@my-noodles/api-lib/logger';
import { TelegramApi } from '@my-noodles/integration-api-clients/telegram';
import { Inject, Injectable } from '@nestjs/common';

import { DeliveryMethod, DeliveryProvider } from '../orders/order-delivery.dto';
import type { OrderDelivery } from '../orders/order-delivery.entity';
import type { Order } from '../orders/order.entity';
import { telegramConfig } from './telegram.config';

const PROVIDER_LABELS: Record<DeliveryProvider, string> = {
  [DeliveryProvider.NovaPoshta]: 'Нова Пошта',
  [DeliveryProvider.Ukrposhta]: 'Укрпошта',
  [DeliveryProvider.Meest]: 'Meest',
};

const METHOD_LABELS: Record<DeliveryMethod, string> = {
  [DeliveryMethod.Warehouse]: 'відділення',
  [DeliveryMethod.Courier]: "кур'єр",
  [DeliveryMethod.Custom]: 'інший спосіб',
};

@Injectable()
export class TelegramService {
  constructor(@Inject(TelegramApi) private readonly telegramApi: TelegramApi) {}

  async sendOrderNotification(order: Order): Promise<void> {
    try {
      const phone = order.phone ?? '';
      const delivery = order.delivery;
      const currency = order.currency;

      const lines = order.items
        .map(
          (line) =>
            `• ${this.escapeHtml(line.titleSnapshot)} × ${line.qty} — ${this.formatMinor(line.priceMinorSnapshot * line.qty, currency)}`,
        )
        .join('\n');

      const text = [
        `<b>Нове замовлення #${this.escapeHtml(order.id.slice(0, 8))}</b>`,
        `<i>${order.createdAt.toISOString()}</i>`,
        '',
        `<b>Клієнт:</b> ${this.escapeHtml(this.formatReceiverName(order))}`,
        `<b>Телефон:</b> <a href="tel:${this.escapeHtml(phone)}">${this.escapeHtml(phone)}</a>`,
        `<b>Доставка:</b>\n${this.escapeHtml(this.formatDelivery(delivery))}`,
        '',
        '<b>Товари:</b>',
        lines,
        '',
        `<b>Разом:</b> ${this.formatMinor(order.totalMinor, currency)}`,
      ].join('\n');

      await this.telegramApi.sendMessage({
        chatId: telegramConfig.chatId,
        text,
        parseMode: 'HTML',
        disableWebPagePreview: true,
      });
    } catch (error: unknown) {
      logger.error({
        msg: 'telegram.notify.failed',
        orderId: order.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  private formatReceiverName(order: Pick<Order, 'firstName' | 'lastName'>): string {
    return [order.lastName, order.firstName]
      .map((part) => part?.trim())
      .filter(Boolean)
      .join(' ');
  }

  private formatDelivery(delivery: OrderDelivery | null): string {
    if (!delivery) {
      return '';
    }

    const provider = PROVIDER_LABELS[delivery.provider];
    const methodLabel = METHOD_LABELS[delivery.method];
    const lines = [`${provider} (${methodLabel})`, delivery.city].filter(Boolean);

    if (delivery.postalCode) {
      lines.push(`Індекс: ${delivery.postalCode}`);
    }

    if (delivery.method === DeliveryMethod.Warehouse || delivery.method === DeliveryMethod.Custom) {
      const warehouseParts = [delivery.warehouseNumber, delivery.warehouseName].filter(Boolean);
      if (warehouseParts.length > 0) {
        lines.push(`Відділення: ${warehouseParts.join(' — ')}`);
      }
    }

    if (delivery.method === DeliveryMethod.Courier || delivery.method === DeliveryMethod.Custom) {
      const addressParts = [
        delivery.street,
        delivery.building,
        delivery.apartment ? `кв. ${delivery.apartment}` : null,
      ].filter(Boolean);
      if (addressParts.length > 0) {
        lines.push(addressParts.join(', '));
      }
    }

    if (delivery.notes) {
      lines.push(delivery.notes);
    }

    if (delivery.estimatedDeliveryAt) {
      const dateLabel = delivery.estimatedDeliveryAt.toLocaleDateString('uk-UA');
      const daysLabel =
        delivery.estimatedDaysMin != null && delivery.estimatedDaysMax != null
          ? ` (${delivery.estimatedDaysMin}–${delivery.estimatedDaysMax} дн.)`
          : '';
      lines.push(`Орієнтовна доставка: ${dateLabel}${daysLabel}`);
    }

    if (delivery.shippingCostMinor != null) {
      lines.push(`Вартість доставки: ${(delivery.shippingCostMinor / 100).toFixed(2)} грн`);
    }

    return lines.join('\n');
  }

  private formatMinor(amountMinor: number, currency: string): string {
    const major = (amountMinor / 100).toFixed(2);
    return `${major} ${currency}`;
  }

  private escapeHtml(value: string): string {
    return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
  }
}
