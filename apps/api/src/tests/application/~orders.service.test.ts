import {
  DeliveryMethod,
  DeliveryProvider,
  HoneypotTriggeredException,
  Order,
  OrderDelivery,
  OrderItem,
  OrderProductNotFoundException,
  OrdersService,
} from '@/application/orders';

import { jest } from '../jest-globals';

describe('OrdersService', () => {
  let transaction: jest.Mock;
  let productsFind: jest.Mock;
  let telegramSend: jest.Mock;
  let service: OrdersService;

  const delivery = {
    provider: DeliveryProvider.NovaPoshta,
    method: DeliveryMethod.Warehouse,
    city: 'Київ',
    warehouseNumber: '1',
    warehouseName: 'Відділення №1',
  };

  beforeEach(() => {
    const orderSave = jest.fn().mockResolvedValue({
      id: 'order-1',
      createdAt: new Date('2025-06-20T10:00:00.000Z'),
      customerName: 'Andrii',
      phone: '+380501112233',
      totalMinor: 19_800,
      currency: 'UAH',
      status: 'new',
    });

    const deliverySave = jest.fn().mockResolvedValue({
      orderId: 'order-1',
      provider: DeliveryProvider.NovaPoshta,
      method: DeliveryMethod.Warehouse,
      city: 'Київ',
      warehouseNumber: '1',
      warehouseName: 'Відділення №1',
      warehouseRef: null,
      street: null,
      building: null,
      apartment: null,
      notes: null,
    });

    const itemSave = jest.fn().mockResolvedValue([]);

    transaction = jest.fn(
      async (
        callback: (manager: { getRepository: (entity: unknown) => { save: jest.Mock } }) => Promise<unknown>,
      ) =>
        callback({
          getRepository: (entity: unknown) => {
            if (entity === Order) {
              return { save: orderSave };
            }

            if (entity === OrderDelivery) {
              return { save: deliverySave };
            }

            if (entity === OrderItem) {
              return { save: itemSave };
            }

            throw new Error('Unexpected repository');
          },
        }),
    );

    productsFind = jest.fn().mockResolvedValue([
      {
        id: 'product-1',
        name: { uk: 'Pocky' },
        priceMinor: 9_900,
      },
    ]);

    telegramSend = jest.fn().mockResolvedValue(undefined);

    service = new OrdersService(
      { transaction } as never,
      { find: productsFind } as never,
      {
        sendOrderNotification: telegramSend,
      } as never,
    );
  });

  it('creates an order and notifies Telegram', async () => {
    const result = await service.create({
      customerName: 'Andrii',
      phone: '+380501112233',
      delivery,
      items: [{ productId: 'product-1', qty: 2 }],
    });

    expect(result.id).toBe('order-1');
    expect(result.totalMinor).toBe(19_800);
    expect(telegramSend).toHaveBeenCalledTimes(1);
    const calls = telegramSend.mock.calls as Array<[{ deliverySummary: string }]>;
    expect(calls[0]?.[0].deliverySummary).toContain('Нова Пошта');
  });

  it('still succeeds when Telegram fails', async () => {
    telegramSend.mockRejectedValueOnce(new Error('network down'));

    const result = await service.create({
      customerName: 'Andrii',
      phone: '+380501112233',
      delivery,
      items: [{ productId: 'product-1', qty: 1 }],
    });

    expect(result.id).toBe('order-1');
  });

  it('rejects honeypot submissions', async () => {
    await expect(
      service.create({
        customerName: 'Bot',
        phone: '+380000000000',
        delivery,
        company: 'Acme Inc',
        items: [{ productId: 'product-1', qty: 1 }],
      }),
    ).rejects.toBeInstanceOf(HoneypotTriggeredException);
  });

  it('rejects unknown products', async () => {
    productsFind.mockResolvedValueOnce([]);

    await expect(
      service.create({
        customerName: 'Andrii',
        phone: '+380501112233',
        delivery,
        items: [{ productId: 'missing', qty: 1 }],
      }),
    ).rejects.toBeInstanceOf(OrderProductNotFoundException);
  });
});
