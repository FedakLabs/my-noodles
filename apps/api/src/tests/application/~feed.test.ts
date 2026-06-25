import { type INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import request from 'supertest';

import {
  FEED_SESSION_COOKIE,
  FeedCommentsService,
  FeedController,
  FeedProductComment,
  FeedService,
  FeedSession,
  FeedSessionLike,
  FeedSessionService,
  FeedSessionView,
} from '@/application/feed';
import { Product } from '@/application/products/product.entity';

import { sampleProduct, sampleProductId } from '../fixtures/products';
import { apiHttpServer, createApiTestApp } from '../helpers/api-test-app';
import { afterAll, beforeAll, beforeEach, describe, expect, it, jest } from '../jest-globals';

describe('feed (e2e)', () => {
  let app: INestApplication;
  let sessionsFindOne: jest.Mock;
  let sessionsSave: jest.Mock;
  let sessionsCreate: jest.Mock;
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

  const sessionId = '22222222-2222-4222-8222-222222222222';

  beforeAll(async () => {
    sessionsFindOne = jest.fn();
    sessionsSave = jest.fn((entity: FeedSession) => Promise.resolve(entity));
    sessionsCreate = jest.fn((entity: Partial<FeedSession>) => entity);
    productsFind = jest.fn().mockResolvedValue([sampleProduct]);
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

    app = await createApiTestApp({
      controllers: [FeedController],
      providers: [
        FeedService,
        FeedSessionService,
        FeedCommentsService,
        {
          provide: getRepositoryToken(FeedSession),
          useValue: {
            findOne: sessionsFindOne,
            save: sessionsSave,
            create: sessionsCreate,
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
      ],
    });
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    productsFind.mockResolvedValue([sampleProduct]);
    productsFindOne.mockResolvedValue({ id: sampleProductId });
    sessionsSave.mockImplementation((entity: FeedSession) => {
      if (!entity.id) {
        entity.id = sessionId;
      }
      return Promise.resolve(entity);
    });
    sessionsCreate.mockImplementation((entity: Partial<FeedSession>) => entity);
  });

  it('POST /api/feed/next mints a feed session cookie when none is present', async () => {
    const server = apiHttpServer(app);

    const response = await request(server)
      .post('/api/feed/next')
      .set('x-app-locale', 'uk')
      .send({})
      .expect(201);

    const body = response.body as { item?: { id: string } };
    const setCookie = response.headers['set-cookie'] as string[] | undefined;

    expect(body.item?.id).toBe(sampleProductId);
    expect(setCookie?.some((entry) => entry.startsWith(`${FEED_SESSION_COOKIE}=`))).toBe(true);
  });

  it('POST /api/feed/next resumes an existing session from the cookie', async () => {
    const future = new Date(Date.now() + 60_000);
    sessionsFindOne.mockResolvedValue({ id: sessionId, expiresAt: future });
    const server = apiHttpServer(app);

    await request(server)
      .post('/api/feed/next')
      .set('x-app-locale', 'uk')
      .set('Cookie', `${FEED_SESSION_COOKIE}=${sessionId}`)
      .send({})
      .expect(201);

    expect(sessionsFindOne).toHaveBeenCalledWith({ where: { id: sessionId } });
    expect(sessionsSave).toHaveBeenCalled();
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
    sessionsFindOne.mockResolvedValue({ id: sessionId, expiresAt: future });
    const server = apiHttpServer(app);

    const response = await request(server)
      .post(`/api/feed/products/${sampleProductId}/like`)
      .set('x-app-locale', 'uk')
      .set('Cookie', `${FEED_SESSION_COOKIE}=${sessionId}`)
      .expect(201);

    expect(response.body).toEqual({ liked: true });
    expect(likesSave).toHaveBeenCalled();
  });

  it('GET /api/feed/products/:productId/comments rejects invalid product ids', async () => {
    const server = apiHttpServer(app);

    await request(server).get('/api/feed/products/not-a-uuid/comments').set('x-app-locale', 'uk').expect(400);
  });
});
