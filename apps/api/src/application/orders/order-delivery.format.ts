import type { OrderDelivery } from './order-delivery.entity';
import { DeliveryMethod, DeliveryProvider } from './order-delivery.types';

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

  return lines.join('\n');
}
