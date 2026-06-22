import { type INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource } from 'typeorm';

import {
  DeliveryMethod,
  DeliveryProvider,
  Order,
  OrderDelivery,
  OrderItem,
  OrdersController,
  OrdersService,
} from '@/application/orders';
import { Product } from '@/application/products/product.entity';
import { TelegramService } from '@/infrastructure/services/Telegram';

import { sampleProduct, sampleProductId } from '../fixtures/products';
import { apiHttpServer, createApiTestApp } from '../helpers/api-test-app';
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '../jest-globals';

describe('orders (e2e)', () => {
  let app: INestApplication;
  let productsFind: jest.Mock;
  let orderSave: jest.Mock;
  let deliverySave: jest.Mock;
  let itemSave: jest.Mock;
  let telegramSend: jest.Mock;

  const delivery = {
    provider: DeliveryProvider.NovaPoshta,
    method: DeliveryMethod.Warehouse,
    city: 'Київ',
    warehouseNumber: '1',
    warehouseName: 'Відділення №1',
  };

  const validPayload = {
    customerName: 'Andrii',
    phone: '+380501112233',
    delivery,
    items: [{ productId: sampleProductId, qty: 1 }],
  };

  beforeAll(async () => {
    productsFind = jest.fn();
    orderSave = jest.fn();
    deliverySave = jest.fn();
    itemSave = jest.fn();
    telegramSend = jest.fn().mockResolvedValue(undefined);

    app = await createApiTestApp({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(async (callback: () => Promise<unknown>) => callback()),
          },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: { find: productsFind },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: { save: orderSave },
        },
        {
          provide: getRepositoryToken(OrderDelivery),
          useValue: { save: deliverySave },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: { save: itemSave },
        },
        {
          provide: TelegramService,
          useValue: { sendOrderNotification: telegramSend },
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    productsFind.mockClear();
    orderSave.mockClear();
    deliverySave.mockClear();
    itemSave.mockClear();
    telegramSend.mockClear();

    productsFind.mockResolvedValue([sampleProduct]);
    orderSave.mockResolvedValue({
      id: '22222222-2222-2222-2222-222222222222',
      createdAt: new Date('2025-06-20T10:00:00.000Z'),
      customerName: validPayload.customerName,
      phone: validPayload.phone,
      totalMinor: 9_900,
      currency: 'UAH',
      status: 'new',
    });
    deliverySave.mockResolvedValue({
      orderId: '22222222-2222-2222-2222-222222222222',
      provider: DeliveryProvider.NovaPoshta,
      method: DeliveryMethod.Warehouse,
      city: delivery.city,
      warehouseNumber: delivery.warehouseNumber,
      warehouseName: delivery.warehouseName,
    });
    itemSave.mockResolvedValue([]);
    telegramSend.mockResolvedValue(undefined);
  });

  it('POST /api/orders creates an order', async () => {
    const server = apiHttpServer(app);

    const response = await request(server).post('/api/orders').send(validPayload).expect(201);

    expect(response.body).toMatchObject({
      id: '22222222-2222-2222-2222-222222222222',
      status: 'new',
      totalMinor: 9_900,
      currency: 'UAH',
    });
    expect(orderSave).toHaveBeenCalledTimes(1);
    expect(telegramSend).toHaveBeenCalledTimes(1);
  });

  it('POST /api/orders returns 404 for unknown products', async () => {
    productsFind.mockResolvedValueOnce([]);

    const server = apiHttpServer(app);

    await request(server)
      .post('/api/orders')
      .send({
        ...validPayload,
        items: [{ productId: '99999999-9999-4999-8999-999999999999', qty: 1 }],
      })
      .expect(404);
  });

  it('POST /api/orders rejects honeypot submissions', async () => {
    const server = apiHttpServer(app);

    await request(server)
      .post('/api/orders')
      .send({ ...validPayload, company: 'Acme Inc' })
      .expect(400);

    expect(orderSave).not.toHaveBeenCalled();
  });

  it('POST /api/orders rejects invalid payloads', async () => {
    const server = apiHttpServer(app);

    await request(server)
      .post('/api/orders')
      .send({ ...validPayload, customerName: '' })
      .expect(400);
  });
});
