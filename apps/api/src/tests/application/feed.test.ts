import { type INestApplication, type MiddlewareConsumer, Module, type NestModule } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';

import { CartItem } from '@/application/cart/cart-item.entity';
import { Category } from '@/application/categories/category.entity';
import { Country } from '@/application/countries/country.entity';
import {
  FeedCommentsService,
  FeedController,
  FeedProductComment,
  FeedService,
  FeedSessionLike,
  FeedSessionService,
  FeedSessionView,
} from '@/application/feed';
import { Order } from '@/application/orders/order.entity';
import { Product } from '@/application/products/product.entity';
import {
  VISITOR_SESSION_COOKIE,
  VisitorSession,
  VisitorSessionMiddleware,
  VisitorSessionService,
} from '@/application/visitor-session';

import { sampleProduct, sampleProductId } from '../fixtures/products';
import { apiHttpServer, createApiTestApp } from '../helpers/api-test-app';
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '../jest-globals';

function asProduct(overrides: Partial<Product> = {}): Product {
  return Object.assign(new Product(), {
    ...sampleProduct,
    country: Object.assign(new Country(), sampleProduct.country),
    category: Object.assign(new Category(), sampleProduct.category),
    ...overrides,
  });
}

describe('feed (e2e)', () => {
  let app: INestApplication;
  let visitorsFindOne: jest.Mock;
  let visitorsSave: jest.Mock;
  let visitorsCreate: jest.Mock;
  let viewsDelete: jest.Mock;
  let productsFind: jest.Mock;
  let productsFindOne: jest.Mock;
  let commentsFind: jest.Mock;
  let likesFindOne: jest.Mock;
  let likesSave: jest.Mock;
  let likesCreate: jest.Mock;
  let likesSoftDelete: jest.Mock;
  let likesFind: jest.Mock;
  let viewsFind: jest.Mock;
  let viewsFindOne: jest.Mock;
  let viewsSave: jest.Mock;
  let viewsCreate: jest.Mock;
  let viewsQueryBuilder: {
    innerJoin: jest.Mock;
    select: jest.Mock;
    addSelect: jest.Mock;
    where: jest.Mock;
    andWhere: jest.Mock;
    groupBy: jest.Mock;
    getRawMany: jest.Mock;
  };

  const visitorId = '22222222-2222-4222-8222-222222222222';

  beforeAll(async () => {
    visitorsFindOne = jest.fn();
    visitorsSave = jest.fn((entity: VisitorSession) => Promise.resolve(entity));
    visitorsCreate = jest.fn((entity: Partial<VisitorSession>) => entity);
    viewsDelete = jest.fn().mockResolvedValue({ affected: 0 });
    productsFind = jest.fn().mockResolvedValue([asProduct()]);
    productsFindOne = jest.fn().mockResolvedValue({ id: sampleProductId });
    commentsFind = jest.fn().mockResolvedValue([]);
    likesFindOne = jest.fn().mockResolvedValue(null);
    likesSave = jest.fn((entity: object) => Promise.resolve(entity));
    likesCreate = jest.fn((entity: object) => entity);
    likesSoftDelete = jest.fn().mockResolvedValue({ affected: 1 });
    likesFind = jest.fn().mockResolvedValue([]);
    viewsFind = jest.fn().mockResolvedValue([]);
    viewsFindOne = jest.fn().mockResolvedValue(null);
    viewsSave = jest.fn((entity: object) => Promise.resolve(entity));
    viewsCreate = jest.fn((entity: object) => entity);
    viewsQueryBuilder = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };

    @Module({
      controllers: [FeedController],
      providers: [
        FeedService,
        FeedSessionService,
        FeedCommentsService,
        VisitorSessionService,
        VisitorSessionMiddleware,
        {
          provide: getRepositoryToken(VisitorSession),
          useValue: {
            findOne: visitorsFindOne,
            save: visitorsSave,
            create: visitorsCreate,
          },
        },
        {
          provide: getRepositoryToken(FeedSessionLike),
          useValue: {
            findOne: likesFindOne,
            save: likesSave,
            create: likesCreate,
            softDelete: likesSoftDelete,
            find: likesFind,
          },
        },
        {
          provide: getRepositoryToken(FeedSessionView),
          useValue: {
            find: viewsFind,
            findOne: viewsFindOne,
            save: viewsSave,
            create: viewsCreate,
            delete: viewsDelete,
            createQueryBuilder: jest.fn().mockReturnValue(viewsQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(FeedProductComment),
          useValue: { find: commentsFind, count: jest.fn().mockResolvedValue(0) },
        },
        {
          provide: getRepositoryToken(Product),
          useValue: {
            find: productsFind,
            findOne: productsFindOne,
          },
        },
        {
          provide: getRepositoryToken(CartItem),
          useValue: { delete: jest.fn() },
        },
        {
          provide: getRepositoryToken(Order),
          useValue: { findOne: jest.fn(), save: jest.fn() },
        },
      ],
    })
    class FeedE2eModule implements NestModule {
      configure(consumer: MiddlewareConsumer): void {
        consumer.apply(VisitorSessionMiddleware).forRoutes(FeedController);
      }
    }

    app = await createApiTestApp({ imports: [FeedE2eModule] });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    productsFind.mockResolvedValue([asProduct()]);
    productsFindOne.mockResolvedValue({ id: sampleProductId });
    visitorsSave.mockImplementation((entity: VisitorSession) => {
      if (!entity.id) {
        entity.id = visitorId;
      }
      return Promise.resolve(entity);
    });
    visitorsCreate.mockImplementation((entity: Partial<VisitorSession>) => entity);
  });

  it('POST /api/feed/next mints a visitor cookie when none is present', async () => {
    const server = apiHttpServer(app);

    const response = await request(server)
      .post('/api/feed/next')
      .set('x-app-locale', 'uk')
      .send({})
      .expect(201);

    const body = response.body as { item?: { id: string } };
    const setCookie = response.headers['set-cookie'] as string[] | undefined;

    expect(body.item?.id).toBe(sampleProductId);
    expect(setCookie?.some((entry) => entry.startsWith(`${VISITOR_SESSION_COOKIE}=`))).toBe(true);
  });

  it('POST /api/feed/next resumes an existing visitor from the cookie', async () => {
    const future = new Date(Date.now() + 60_000);
    visitorsFindOne.mockResolvedValue({ id: visitorId, feedExpiresAt: future, cartExpiresAt: future });
    const server = apiHttpServer(app);

    await request(server)
      .post('/api/feed/next')
      .set('x-app-locale', 'uk')
      .set('Cookie', `${VISITOR_SESSION_COOKIE}=${visitorId}`)
      .send({})
      .expect(201);

    expect(visitorsFindOne).toHaveBeenCalledWith({ where: { id: visitorId } });
    expect(visitorsSave).toHaveBeenCalled();
  });

  it('POST /api/feed/next validates previousProduct id as a UUID', async () => {
    const server = apiHttpServer(app);

    await request(server)
      .post('/api/feed/next')
      .set('x-app-locale', 'uk')
      .send({ previousProduct: { id: 'not-a-uuid', viewTime: 1000 } })
      .expect(400);
  });

  it('POST /api/feed/products/:productId/like rejects invalid product ids', async () => {
    const server = apiHttpServer(app);

    await request(server).post('/api/feed/products/not-a-uuid/like').set('x-app-locale', 'uk').expect(400);
  });

  it('POST /api/feed/products/:productId/like returns liked state for a valid product', async () => {
    const future = new Date(Date.now() + 60_000);
    visitorsFindOne.mockResolvedValue({ id: visitorId, feedExpiresAt: future, cartExpiresAt: future });
    const server = apiHttpServer(app);

    const response = await request(server)
      .post(`/api/feed/products/${sampleProductId}/like`)
      .set('x-app-locale', 'uk')
      .set('Cookie', `${VISITOR_SESSION_COOKIE}=${visitorId}`)
      .expect(201);

    expect(response.body).toEqual({ liked: true });
    expect(likesSave).toHaveBeenCalled();
  });

  it('GET /api/feed/products/:productId/comments rejects invalid product ids', async () => {
    const server = apiHttpServer(app);

    await request(server).get('/api/feed/products/not-a-uuid/comments').set('x-app-locale', 'uk').expect(400);
  });
});
