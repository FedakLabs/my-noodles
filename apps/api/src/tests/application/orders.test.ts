import { type INestApplication, type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';

import { InventoryService } from '@/application/inventory/inventory.service';
import { Order, OrdersController, OrdersService, OrderStatus } from '@/application/orders';
import {
  VisitorSessionMiddleware,
  VisitorSessionService,
  VISITOR_SESSION_COOKIE,
} from '@/application/visitor-session';

import { apiHttpServer, createApiTestApp } from '../helpers/api-test-app';
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '../jest-globals';

describe('orders (e2e)', () => {
  let app: INestApplication;
  let ordersFindOne: jest.Mock;
  let orderSave: jest.Mock;
  let visitorResolve: jest.Mock;

  const orderId = '44444444-4444-4444-8444-444444444444';
  const visitorId = '33333333-3333-4333-8333-333333333333';

  beforeAll(async () => {
    ordersFindOne = jest.fn();
    orderSave = jest.fn();
    visitorResolve = jest.fn().mockResolvedValue({ id: visitorId });

    @Module({
      controllers: [OrdersController],
      providers: [
        OrdersService,
        VisitorSessionMiddleware,
        {
          provide: getRepositoryToken(Order),
          useValue: { findOne: ordersFindOne, save: orderSave },
        },
        {
          provide: InventoryService,
          useValue: { restoreOnCancel: jest.fn() },
        },
        {
          provide: VisitorSessionService,
          useValue: { resolve: visitorResolve },
        },
      ],
    })
    class OrdersE2eModule implements NestModule {
      configure(consumer: MiddlewareConsumer): void {
        consumer.apply(VisitorSessionMiddleware).forRoutes(OrdersController);
      }
    }

    app = await createApiTestApp({ imports: [OrdersE2eModule] });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    orderSave.mockImplementation((entity: object) => Promise.resolve(entity));
    visitorResolve.mockResolvedValue({ id: visitorId });
  });

  it('GET /api/orders/:id returns the visitor-owned order', async () => {
    ordersFindOne.mockResolvedValue({
      id: orderId,
      visitorSessionId: visitorId,
      status: OrderStatus.New,
      totalMinor: 9_900,
      currency: 'UAH',
      delivery: { shippingCostMinor: null },
      items: [{ productId: 'product-1', qty: 1 }],
    });

    const response = await request(apiHttpServer(app))
      .get(`/api/orders/${orderId}`)
      .set('Cookie', `${VISITOR_SESSION_COOKIE}=${visitorId}`)
      .expect(200);

    expect(response.body).toMatchObject({
      id: orderId,
      status: OrderStatus.New,
      grandTotalMinor: 9_900,
    });
    expect(ordersFindOne).toHaveBeenCalledWith({
      where: { id: orderId, visitorSessionId: visitorId },
    });
  });

  it('GET /api/orders/:id returns 404 when order is not owned by visitor', async () => {
    ordersFindOne.mockResolvedValue(null);

    await request(apiHttpServer(app))
      .get(`/api/orders/${orderId}`)
      .set('Cookie', `${VISITOR_SESSION_COOKIE}=${visitorId}`)
      .expect(404);
  });
});
