import { DeliveryMethod, DeliveryProvider } from './order-delivery.dto';
import type { OrderDelivery } from './order-delivery.entity';

const PROVIDER_LABELS: Record<DeliveryProvider, string> = {
  [DeliveryProvider.NovaPoshta]: 'Нова Пошта',
  [DeliveryProvider.Ukrposhta]: 'Укрпошта',
  [DeliveryProvider.Meest]: 'Meest',
};

export function formatOrderDelivery(
  delivery: Pick<
    OrderDelivery,
    | 'provider'
    | 'method'
    | 'city'
    | 'warehouseNumber'
    | 'warehouseName'
    | 'street'
    | 'building'
    | 'apartment'
    | 'notes'
    | 'estimatedDeliveryAt'
    | 'estimatedDaysMin'
    | 'estimatedDaysMax'
    | 'shippingCostMinor'
  >,
): string {
  const provider = PROVIDER_LABELS[delivery.provider];
  const methodLabel = delivery.method === DeliveryMethod.Warehouse ? 'відділення' : "кур'єр";
  const lines = [`${provider} (${methodLabel})`, delivery.city];

  if (delivery.method === DeliveryMethod.Warehouse) {
    const warehouseParts = [delivery.warehouseNumber, delivery.warehouseName].filter(Boolean);
    if (warehouseParts.length > 0) {
      lines.push(`Відділення: ${warehouseParts.join(' — ')}`);
    }
  } else {
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
