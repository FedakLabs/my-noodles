import type { TelegramApi } from '@my-noodles/integration-api-clients/telegram';

import { DeliveryMethod, DeliveryProvider, type OrderDelivery } from '@/application/orders';
import type { Order } from '@/application/orders/order.entity';
import { TelegramService } from '@/application/telegram';

import { jest } from '../jest-globals';

describe('TelegramService', () => {
  let sendMessage: jest.Mock;
  let service: TelegramService;

  beforeEach(() => {
    sendMessage = jest.fn().mockResolvedValue(undefined);
    service = new TelegramService({ sendMessage } as unknown as TelegramApi);
  });

  it('formats warehouse delivery in the notification', async () => {
    await service.sendOrderNotification(
      createOrder({
        delivery: {
          provider: DeliveryProvider.NovaPoshta,
          method: DeliveryMethod.Warehouse,
          city: 'Київ',
          warehouseNumber: '1',
          warehouseName: 'Відділення №1',
          street: null,
          building: null,
          apartment: null,
          notes: null,
          estimatedDeliveryAt: null,
          estimatedDaysMin: null,
          estimatedDaysMax: null,
          shippingCostMinor: null,
        } as OrderDelivery,
      }),
    );

    const text = String(sendMessage.mock.calls[0]?.[0]?.text);
    expect(text).toContain('Нова Пошта');
    expect(text).toContain('відділення');
    expect(text).toContain('Київ');
    expect(text).toContain('1');
  });

  it('formats courier delivery in the notification', async () => {
    await service.sendOrderNotification(
      createOrder({
        delivery: {
          provider: DeliveryProvider.Meest,
          method: DeliveryMethod.Courier,
          city: 'Львів',
          warehouseNumber: null,
          warehouseName: null,
          street: 'вул. Городоцька',
          building: '12',
          apartment: '4',
          notes: 'Дзвонити перед приїздом',
          estimatedDeliveryAt: null,
          estimatedDaysMin: null,
          estimatedDaysMax: null,
          shippingCostMinor: null,
        } as OrderDelivery,
      }),
    );

    const text = String(sendMessage.mock.calls[0]?.[0]?.text);
    expect(text).toContain('Meest');
    expect(text).toContain("кур'єр");
    expect(text).toContain('вул. Городоцька');
    expect(text).toContain('кв. 4');
  });

  it('includes estimated delivery snapshot when present', async () => {
    await service.sendOrderNotification(
      createOrder({
        delivery: {
          provider: DeliveryProvider.NovaPoshta,
          method: DeliveryMethod.Warehouse,
          city: 'Київ',
          warehouseNumber: '1',
          warehouseName: 'Відділення №1',
          street: null,
          building: null,
          apartment: null,
          notes: null,
          estimatedDeliveryAt: new Date('2025-06-22T00:00:00.000Z'),
          estimatedDaysMin: 2,
          estimatedDaysMax: 4,
          shippingCostMinor: 9_000,
        } as OrderDelivery,
      }),
    );

    const text = String(sendMessage.mock.calls[0]?.[0]?.text);
    expect(text).toContain('Орієнтовна доставка');
    expect(text).toContain('2–4 дн.');
    expect(text).toContain('Вартість доставки: 90.00 грн');
  });

  it('swallows telegram API failures', async () => {
    sendMessage.mockRejectedValue(new Error('telegram down'));

    await expect(service.sendOrderNotification(createOrder({}))).resolves.toBeUndefined();
  });
});

function createOrder(overrides: { delivery?: Order['delivery'] }): Order {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    createdAt: new Date('2025-06-20T10:00:00.000Z'),
    firstName: 'Andrii',
    lastName: 'Fedak',
    phone: '+380501112233',
    currency: 'UAH',
    totalMinor: 9900,
    items: [{ titleSnapshot: 'Pocky', qty: 1, priceMinorSnapshot: 9900 }],
    delivery: null,
    ...overrides,
  } as Order;
}
