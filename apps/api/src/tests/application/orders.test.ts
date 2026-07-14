import { type INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';

import { InventoryService } from '@/application/inventory/inventory.service';
import {
  Order,
  OrderCancelledReason,
  OrdersController,
  OrdersService,
  OrderStatus,
} from '@/application/orders';

import { apiHttpServer, createApiTestApp } from '../helpers/api-test-app';
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '../jest-globals';

describe('orders (e2e)', () => {
  let app: INestApplication;
  let ordersFindOne: jest.Mock;
  let orderSave: jest.Mock;
  let restoreOnCancel: jest.Mock;

  const orderId = '44444444-4444-4444-8444-444444444444';

  beforeAll(async () => {
    ordersFindOne = jest.fn();
    orderSave = jest.fn();
    restoreOnCancel = jest.fn().mockResolvedValue(undefined);

    app = await createApiTestApp({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: { findOne: ordersFindOne, save: orderSave },
        },
        {
          provide: InventoryService,
          useValue: { restoreOnCancel },
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    orderSave.mockImplementation((entity: object) => Promise.resolve(entity));
  });

  it('POST /api/orders/:id/cancel cancels a submitted order', async () => {
    ordersFindOne.mockResolvedValue({
      id: orderId,
      status: OrderStatus.New,
      cancelledReason: null,
      totalMinor: 9_900,
      currency: 'UAH',
      createdAt: new Date('2025-06-20T10:00:00.000Z'),
      items: [{ productId: 'product-1', qty: 1 }],
    });

    const server = apiHttpServer(app);

    const response = await request(server)
      .post(`/api/orders/${orderId}/cancel`)
      .send({ reason: OrderCancelledReason.OutOfStock })
      .expect(201);

    expect(response.body).toMatchObject({ id: orderId, status: OrderStatus.Cancelled });
    expect(restoreOnCancel).toHaveBeenCalled();
  });

  it('POST /api/orders/:id/cancel returns 409 for draft orders', async () => {
    ordersFindOne.mockResolvedValue({
      id: orderId,
      status: OrderStatus.Draft,
      items: [],
    });

    const server = apiHttpServer(app);

    await request(server)
      .post(`/api/orders/${orderId}/cancel`)
      .send({ reason: OrderCancelledReason.CustomerRequest })
      .expect(409);
  });
});
