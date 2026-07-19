import { type INestApplication, type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';
import { DataSource } from 'typeorm';

import { CartService } from '@/application/cart/cart.service';
import { Checkout } from '@/application/checkouts/checkout.entity';
import { CheckoutsController } from '@/application/checkouts/checkouts.controller';
import { CheckoutsService } from '@/application/checkouts/checkouts.service';
import { CheckoutStatus } from '@/application/checkouts/checkouts.validators';
import { DeliveryService } from '@/application/delivery';
import { InventoryService } from '@/application/inventory/inventory.service';
import { Order, OrderDelivery, OrderItem, OrderStatus } from '@/application/orders';
import { TelegramService } from '@/application/telegram';
import { VisitorSessionMiddleware, VisitorSessionService } from '@/application/visitor-session';

import { sampleProductId } from '../fixtures/products';
import { apiHttpServer, createApiTestApp } from '../helpers/api-test-app';
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '../jest-globals';

function asCheckout(partial: object): Checkout {
  return Object.assign(new Checkout(), partial);
}

describe('checkouts (e2e)', () => {
  let app: INestApplication;
  let checkoutsFindOne: jest.Mock;
  let checkoutsFind: jest.Mock;
  let checkoutCreate: jest.Mock;
  let checkoutSave: jest.Mock;
  let checkoutUpdate: jest.Mock;
  let orderCreate: jest.Mock;
  let orderSave: jest.Mock;
  let deliveryCreate: jest.Mock;
  let deliverySave: jest.Mock;
  let itemCreate: jest.Mock;
  let itemSave: jest.Mock;
  let telegramSend: jest.Mock;
  let getCartItems: jest.Mock;
  let clearCartItems: jest.Mock;
  let visitorResolve: jest.Mock;

  const checkoutId = '22222222-2222-2222-2222-222222222222';
  const orderId = '44444444-4444-4444-8444-444444444444';
  const visitorId = '33333333-3333-4333-8333-333333333333';
  const futureExpiresAt = () => new Date(Date.now() + 15 * 60_000);
  const pastExpiresAt = () => new Date(Date.now() - 60_000);

  beforeAll(async () => {
    checkoutsFindOne = jest.fn();
    checkoutsFind = jest.fn().mockResolvedValue([]);
    checkoutCreate = jest
      .fn()
      .mockImplementation((entity: object) => Object.assign(Object.create(Checkout.prototype), entity));
    checkoutSave = jest.fn();
    checkoutUpdate = jest.fn().mockResolvedValue({ affected: 1 });
    orderCreate = jest
      .fn()
      .mockImplementation((entity: object) => Object.assign(Object.create(Order.prototype), entity));
    orderSave = jest.fn();
    deliveryCreate = jest
      .fn()
      .mockImplementation((entity: object) => Object.assign(Object.create(OrderDelivery.prototype), entity));
    deliverySave = jest.fn();
    itemCreate = jest.fn().mockImplementation((entities: object | object[]) => {
      const create = (entity: object) => Object.assign(Object.create(OrderItem.prototype), entity);
      return Array.isArray(entities) ? entities.map(create) : create(entities);
    });
    itemSave = jest.fn();
    telegramSend = jest.fn().mockResolvedValue(undefined);
    getCartItems = jest.fn();
    clearCartItems = jest.fn().mockResolvedValue(undefined);
    visitorResolve = jest.fn().mockResolvedValue({ id: visitorId });

    @Module({
      controllers: [CheckoutsController],
      providers: [
        CheckoutsService,
        VisitorSessionMiddleware,
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(async (callback: () => Promise<unknown>) => await callback()),
          },
        },
        {
          provide: getRepositoryToken(Checkout),
          useValue: {
            findOne: checkoutsFindOne,
            find: checkoutsFind,
            create: checkoutCreate,
            save: checkoutSave,
            update: checkoutUpdate,
          },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: { create: orderCreate, save: orderSave },
        },
        {
          provide: getRepositoryToken(OrderDelivery),
          useValue: { create: deliveryCreate, save: deliverySave },
        },
        {
          provide: getRepositoryToken(OrderItem),
          useValue: { create: itemCreate, save: itemSave },
        },
        {
          provide: TelegramService,
          useValue: { sendOrderNotification: telegramSend },
        },
        {
          provide: CartService,
          useValue: {
            getCartItems,
            clearCartItems,
            applyReconciledQuantities: jest.fn(),
            restoreItemsFromOrder: jest.fn(),
          },
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
      ],
    })
    class CheckoutsE2eModule implements NestModule {
      configure(consumer: MiddlewareConsumer): void {
        consumer.apply(VisitorSessionMiddleware).forRoutes(CheckoutsController);
      }
    }

    app = await createApiTestApp({ imports: [CheckoutsE2eModule] });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    checkoutUpdate.mockResolvedValue({ affected: 1 });
    visitorResolve.mockResolvedValue({ id: visitorId });
    getCartItems.mockResolvedValue([
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
    checkoutSave.mockImplementation((entity: Checkout) => {
      entity.setDefaultExpiresAt();
      const saved = asCheckout({
        ...entity,
        id: checkoutId,
        orderId,
        createdAt: new Date('2025-06-20T10:00:00.000Z'),
        visitorSessionId: visitorId,
        order: {
          id: orderId,
          totalMinor: 9_900,
          currency: 'UAH',
          status: OrderStatus.Draft,
          items: [{ productId: sampleProductId, qty: 1 }],
          delivery: null,
        },
      });
      checkoutsFindOne.mockResolvedValue(saved);
      return Promise.resolve(saved);
    });
  });

  it('POST /api/checkouts starts checkout from cart items', async () => {
    const server = apiHttpServer(app);

    const response = await request(server).post('/api/checkouts').expect(201);

    expect(response.body).toMatchObject({
      id: checkoutId,
      orderId,
      status: CheckoutStatus.Active,
      order: {
        totalMinor: 9_900,
        currency: 'UAH',
      },
    });
    expect(clearCartItems).toHaveBeenCalledWith(visitorId);
  });

  it('POST /api/checkouts returns 400 when cart is empty', async () => {
    getCartItems.mockResolvedValueOnce([]);
    const server = apiHttpServer(app);

    await request(server).post('/api/checkouts').expect(400);
  });

  it('GET /api/checkouts?status=active lists visitor checkouts', async () => {
    checkoutsFind.mockResolvedValue([
      asCheckout({
        id: checkoutId,
        orderId,
        status: CheckoutStatus.Active,
        updatedAt: new Date('2025-06-20T10:05:00.000Z'),
        createdAt: new Date('2025-06-20T10:00:00.000Z'),
        expiresAt: futureExpiresAt(),
        order: {
          items: [{ qty: 1 }],
          totalMinor: 9_900,
          currency: 'UAH',
        },
      }),
    ]);

    const server = apiHttpServer(app);

    const response = await request(server).get('/api/checkouts?status=active').expect(200);

    const body = response.body as Array<{ id: string; status: string; order: { items: unknown[] } }>;
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({
      id: checkoutId,
      status: CheckoutStatus.Active,
      order: { items: [{ qty: 1 }] },
    });
  });

  it('GET /api/checkouts/:id returns cancelled checkout with status', async () => {
    checkoutsFindOne.mockResolvedValue(
      asCheckout({
        id: checkoutId,
        orderId,
        visitorSessionId: visitorId,
        status: CheckoutStatus.Cancelled,
        cancelledReason: 'user',
        createdAt: new Date(),
        expiresAt: pastExpiresAt(),
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
      }),
    );

    const server = apiHttpServer(app);

    const response = await request(server).get(`/api/checkouts/${checkoutId}`).expect(200);

    expect(response.body).toMatchObject({
      id: checkoutId,
      status: CheckoutStatus.Cancelled,
      cancelledReason: 'user',
    });
  });

  it('DELETE /api/checkouts/:id cancels checkout', async () => {
    checkoutsFindOne.mockResolvedValue(
      asCheckout({
        id: checkoutId,
        orderId,
        visitorSessionId: visitorId,
        status: CheckoutStatus.Active,
        cancelledReason: null,
        createdAt: new Date(),
        expiresAt: futureExpiresAt(),
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
      }),
    );

    const server = apiHttpServer(app);

    const response = await request(server)
      .delete(`/api/checkouts/${checkoutId}`)
      .send({ reason: 'user' })
      .expect(200);

    expect(response.body).toMatchObject({ status: CheckoutStatus.Cancelled });
  });

  it('PATCH /api/checkouts/:id/receiver autosaves receiver fields', async () => {
    checkoutsFindOne
      .mockResolvedValueOnce(
        asCheckout({
          id: checkoutId,
          orderId,
          visitorSessionId: visitorId,
          status: CheckoutStatus.Active,
          cancelledReason: null,
          createdAt: new Date(),
          expiresAt: futureExpiresAt(),
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
        }),
      )
      .mockResolvedValueOnce(
        asCheckout({
          id: checkoutId,
          orderId,
          visitorSessionId: visitorId,
          status: CheckoutStatus.Active,
          cancelledReason: null,
          createdAt: new Date(),
          expiresAt: futureExpiresAt(),
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
        }),
      );

    const server = apiHttpServer(app);

    const response = await request(server)
      .patch(`/api/checkouts/${checkoutId}/receiver`)
      .send({ firstName: 'Andrii', lastName: 'Fedak', phone: '+380501112233' })
      .expect(200);

    expect(response.body).toMatchObject({
      order: {
        firstName: 'Andrii',
        lastName: 'Fedak',
        phone: '+380501112233',
      },
    });
    expect(orderSave).toHaveBeenCalled();
    expect(deliverySave).not.toHaveBeenCalled();
  });

  it('PATCH /api/checkouts/:id/receiver returns 400 for invalid phone', async () => {
    checkoutsFindOne.mockResolvedValue(
      asCheckout({
        id: checkoutId,
        orderId,
        visitorSessionId: visitorId,
        status: CheckoutStatus.Active,
        cancelledReason: null,
        createdAt: new Date(),
        expiresAt: futureExpiresAt(),
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
      }),
    );

    const server = apiHttpServer(app);

    await request(server)
      .patch(`/api/checkouts/${checkoutId}/receiver`)
      .send({ phone: 'not-a-phone' })
      .expect(400);

    expect(orderSave).not.toHaveBeenCalled();
  });

  it('PATCH /api/checkouts/:id/delivery inserts delivery with order_id when none exists', async () => {
    checkoutsFindOne
      .mockResolvedValueOnce(
        asCheckout({
          id: checkoutId,
          orderId,
          visitorSessionId: visitorId,
          status: CheckoutStatus.Active,
          cancelledReason: null,
          createdAt: new Date(),
          expiresAt: futureExpiresAt(),
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
        }),
      )
      .mockResolvedValueOnce(
        asCheckout({
          id: checkoutId,
          orderId,
          visitorSessionId: visitorId,
          status: CheckoutStatus.Active,
          cancelledReason: null,
          createdAt: new Date(),
          expiresAt: futureExpiresAt(),
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
        }),
      );

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
        city: 'Львів',
        cityRef: 'city-lviv',
      }),
    );
    expect(orderSave).toHaveBeenCalled();
  });
});
