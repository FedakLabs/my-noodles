import { APP_LOGGER } from '@my-noodles/api-lib/logging';
import { type INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { CartService } from '@/application/cart/cart.service';
import { Checkout } from '@/application/checkouts/checkout.entity';
import { CheckoutStatus } from '@/application/checkouts/checkout-status';
import { CheckoutsController } from '@/application/checkouts/checkouts.controller';
import { CheckoutsService } from '@/application/checkouts/checkouts.service';
import { DeliveryService } from '@/application/delivery';
import { InventoryService } from '@/application/inventory/inventory.service';
import { Order, OrderDelivery, OrderItem, OrderStatus } from '@/application/orders';
import { VisitorSessionService } from '@/application/visitor';
import { TelegramService } from '@/infrastructure/external-apis/telegram';

import { sampleProductId } from '../fixtures/products';
import { apiHttpServer, createApiTestApp } from '../helpers/api-test-app';
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '../jest-globals';

describe('checkouts (e2e)', () => {
  let app: INestApplication;
  let checkoutsFindOne: jest.Mock;
  let checkoutsFind: jest.Mock;
  let checkoutSave: jest.Mock;
  let orderSave: jest.Mock;
  let deliverySave: jest.Mock;
  let itemSave: jest.Mock;
  let telegramSend: jest.Mock;
  let getCartItemsForOrder: jest.Mock;
  let clearCartItems: jest.Mock;
  let visitorResolve: jest.Mock;

  const checkoutId = '22222222-2222-2222-2222-222222222222';
  const orderId = '44444444-4444-4444-8444-444444444444';
  const visitorId = '33333333-3333-4333-8333-333333333333';

  beforeAll(async () => {
    checkoutsFindOne = jest.fn();
    checkoutsFind = jest.fn().mockResolvedValue([]);
    checkoutSave = jest.fn();
    orderSave = jest.fn();
    deliverySave = jest.fn();
    itemSave = jest.fn();
    telegramSend = jest.fn().mockResolvedValue(undefined);
    getCartItemsForOrder = jest.fn();
    clearCartItems = jest.fn().mockResolvedValue(undefined);
    visitorResolve = jest.fn().mockResolvedValue({ id: visitorId });

    app = await createApiTestApp({
      controllers: [CheckoutsController],
      providers: [
        CheckoutsService,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(async (callback: () => Promise<unknown>) => callback()),
          },
        },
        {
          provide: getRepositoryToken(Checkout),
          useValue: { findOne: checkoutsFindOne, find: checkoutsFind, save: checkoutSave },
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
        {
          provide: CartService,
          useValue: { getCartItemsForOrder, clearCartItems, applyReconciledQuantities: jest.fn() },
        },
        {
          provide: InventoryService,
          useValue: {
            getAvailableQtyBatch: jest.fn().mockResolvedValue(new Map()),
            getGrossQtyBatch: jest.fn().mockResolvedValue(new Map()),
            reconcileLines: jest.fn().mockReturnValue({ changed: false }),
            deductOnSubmit: jest.fn(),
          },
        },
        {
          provide: VisitorSessionService,
          useValue: { resolve: visitorResolve },
        },
        {
          provide: DeliveryService,
          useValue: { estimateForOrder: jest.fn().mockResolvedValue(null) },
        },
        {
          provide: APP_LOGGER,
          useValue: { info: jest.fn(), error: jest.fn() },
        },
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    visitorResolve.mockResolvedValue({ id: visitorId });
    getCartItemsForOrder.mockResolvedValue([
      {
        productId: sampleProductId,
        qty: 1,
        product: {
          id: sampleProductId,
          name: { localized: 'Pocky Matcha' },
          priceMinor: 9_900,
          currency: 'UAH',
        },
      },
    ]);
    orderSave.mockImplementation((entity: object) =>
      Promise.resolve({
        id: orderId,
        createdAt: new Date('2025-06-20T10:00:00.000Z'),
        totalMinor: 9_900,
        currency: 'UAH',
        status: OrderStatus.Draft,
        visitorSessionId: visitorId,
        firstName: null,
        lastName: null,
        phone: null,
        ...entity,
      }),
    );
    checkoutSave.mockImplementation((entity: object) =>
      Promise.resolve({
        id: checkoutId,
        orderId,
        createdAt: new Date('2025-06-20T10:00:00.000Z'),
        status: CheckoutStatus.InProgress,
        visitorSessionId: visitorId,
        ...entity,
      }),
    );
  });

  it('POST /api/checkouts starts checkout from cart items', async () => {
    const server = apiHttpServer(app);

    const response = await request(server).post('/api/checkouts').expect(201);

    expect(response.body).toMatchObject({
      id: checkoutId,
      orderId,
      status: CheckoutStatus.InProgress,
      totalMinor: 9_900,
      currency: 'UAH',
    });
    expect(clearCartItems).toHaveBeenCalledWith(visitorId);
  });

  it('POST /api/checkouts returns 400 when cart is empty', async () => {
    getCartItemsForOrder.mockResolvedValueOnce([]);
    const server = apiHttpServer(app);

    await request(server).post('/api/checkouts').expect(400);
  });

  it('GET /api/checkouts?status=in_progress lists visitor checkouts', async () => {
    checkoutsFind.mockResolvedValue([
      {
        id: checkoutId,
        orderId,
        status: CheckoutStatus.InProgress,
        updatedAt: new Date('2025-06-20T10:05:00.000Z'),
        createdAt: new Date('2025-06-20T10:00:00.000Z'),
        order: {
          items: [{ qty: 1 }],
          totalMinor: 9_900,
          currency: 'UAH',
        },
      },
    ]);

    const server = apiHttpServer(app);

    const response = await request(server).get('/api/checkouts?status=in_progress').expect(200);

    const body = response.body as { items: Array<{ id: string; status: string; itemCount: number }> };
    expect(body.items).toHaveLength(1);
    expect(body.items[0]).toMatchObject({
      id: checkoutId,
      status: CheckoutStatus.InProgress,
      itemCount: 1,
    });
  });

  it('GET /api/checkouts/:id returns 409 when checkout is cancelled', async () => {
    checkoutsFindOne.mockResolvedValue({
      id: checkoutId,
      orderId,
      visitorSessionId: visitorId,
      status: CheckoutStatus.Cancelled,
      cancelledReason: 'user',
      createdAt: new Date(),
      order: {
        id: orderId,
        status: OrderStatus.Draft,
        items: [],
        delivery: null,
        totalMinor: 9_900,
        currency: 'UAH',
        firstName: null,
        lastName: null,
        phone: null,
        createdAt: new Date(),
      },
    });

    const server = apiHttpServer(app);

    const response = await request(server).get(`/api/checkouts/${checkoutId}`).expect(409);

    expect(response.body).toMatchObject({
      identifier: 'checkout_not_in_progress',
      payload: { checkoutId, status: CheckoutStatus.Cancelled },
    });
  });

  it('DELETE /api/checkouts/:id cancels checkout', async () => {
    checkoutsFindOne.mockResolvedValue({
      id: checkoutId,
      orderId,
      visitorSessionId: visitorId,
      status: CheckoutStatus.InProgress,
      cancelledReason: null,
      createdAt: new Date(),
      order: {
        id: orderId,
        status: OrderStatus.Draft,
        items: [],
        delivery: null,
        totalMinor: 9_900,
        currency: 'UAH',
        firstName: null,
        lastName: null,
        phone: null,
        createdAt: new Date(),
      },
    });

    const server = apiHttpServer(app);

    const response = await request(server).delete(`/api/checkouts/${checkoutId}`).expect(200);

    expect(response.body).toMatchObject({ status: CheckoutStatus.Cancelled });
  });

  it('PATCH /api/checkouts/:id/receiver autosaves receiver fields', async () => {
    checkoutsFindOne
      .mockResolvedValueOnce({
        id: checkoutId,
        orderId,
        visitorSessionId: visitorId,
        status: CheckoutStatus.InProgress,
        cancelledReason: null,
        createdAt: new Date(),
        order: {
          id: orderId,
          status: OrderStatus.Draft,
          items: [],
          delivery: null,
          totalMinor: 9_900,
          currency: 'UAH',
          firstName: null,
          lastName: null,
          phone: null,
          createdAt: new Date(),
        },
      })
      .mockResolvedValueOnce({
        id: checkoutId,
        orderId,
        visitorSessionId: visitorId,
        status: CheckoutStatus.InProgress,
        cancelledReason: null,
        createdAt: new Date(),
        order: {
          id: orderId,
          status: OrderStatus.Draft,
          items: [],
          delivery: null,
          totalMinor: 9_900,
          currency: 'UAH',
          firstName: 'Andrii',
          lastName: 'Fedak',
          phone: '+380501112233',
          createdAt: new Date(),
        },
      });

    const server = apiHttpServer(app);

    const response = await request(server)
      .patch(`/api/checkouts/${checkoutId}/receiver`)
      .send({ firstName: 'Andrii', lastName: 'Fedak', phone: '+380501112233' })
      .expect(200);

    expect(response.body).toMatchObject({
      firstName: 'Andrii',
      lastName: 'Fedak',
      phone: '+380501112233',
    });
    expect(orderSave).toHaveBeenCalled();
    expect(deliverySave).not.toHaveBeenCalled();
  });

  it('PATCH /api/checkouts/:id/receiver returns 400 for invalid phone', async () => {
    checkoutsFindOne.mockResolvedValue({
      id: checkoutId,
      orderId,
      visitorSessionId: visitorId,
      status: CheckoutStatus.InProgress,
      cancelledReason: null,
      createdAt: new Date(),
      order: {
        id: orderId,
        status: OrderStatus.Draft,
        items: [],
        delivery: null,
        totalMinor: 9_900,
        currency: 'UAH',
        firstName: null,
        lastName: null,
        phone: null,
        createdAt: new Date(),
      },
    });

    const server = apiHttpServer(app);

    await request(server)
      .patch(`/api/checkouts/${checkoutId}/receiver`)
      .send({ phone: 'not-a-phone' })
      .expect(400);

    expect(orderSave).not.toHaveBeenCalled();
  });

  it('PATCH /api/checkouts/:id/delivery inserts delivery with order_id when none exists', async () => {
    checkoutsFindOne
      .mockResolvedValueOnce({
        id: checkoutId,
        orderId,
        visitorSessionId: visitorId,
        status: CheckoutStatus.InProgress,
        cancelledReason: null,
        createdAt: new Date(),
        order: {
          id: orderId,
          status: OrderStatus.Draft,
          items: [],
          delivery: null,
          totalMinor: 9_900,
          currency: 'UAH',
          firstName: 'Andrii',
          lastName: 'Fedak',
          phone: '+380501112233',
          createdAt: new Date(),
        },
      })
      .mockResolvedValueOnce({
        id: checkoutId,
        orderId,
        visitorSessionId: visitorId,
        status: CheckoutStatus.InProgress,
        cancelledReason: null,
        createdAt: new Date(),
        order: {
          id: orderId,
          status: OrderStatus.Draft,
          items: [],
          delivery: {
            orderId,
            provider: 'nova-poshta',
            method: 'warehouse',
            city: 'Львів',
            cityRef: 'city-lviv',
            warehouseName: '',
            warehouseNumber: '',
            warehouseRef: '',
          },
          totalMinor: 9_900,
          currency: 'UAH',
          firstName: 'Andrii',
          lastName: 'Fedak',
          phone: '+380501112233',
          createdAt: new Date(),
        },
      });

    deliverySave.mockImplementation((entity: { orderId?: string }) =>
      Promise.resolve({ id: 'delivery-1', ...entity }),
    );

    const server = apiHttpServer(app);

    await request(server)
      .patch(`/api/checkouts/${checkoutId}/delivery`)
      .send({
        provider: 'nova-poshta',
        method: 'warehouse',
        city: 'Львів',
        cityRef: 'city-lviv',
        warehouseName: '',
        warehouseNumber: '',
        warehouseRef: '',
      })
      .expect(200);

    expect(deliverySave).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId,
        order: expect.objectContaining({ id: orderId }),
        city: 'Львів',
        cityRef: 'city-lviv',
      }),
    );
    expect(orderSave).toHaveBeenCalled();
  });
});
