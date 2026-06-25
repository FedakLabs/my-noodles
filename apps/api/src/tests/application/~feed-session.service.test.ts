import type { Repository } from 'typeorm';

import {
  FeedProductNotFoundException,
  type FeedSession,
  type FeedSessionLike,
  FeedSessionService,
  type FeedSessionView,
} from '@/application/feed';
import type { Product } from '@/application/products';

import { jest } from '../jest-globals';

describe('FeedSessionService', () => {
  let sessionsFindOne: jest.Mock;
  let sessionsSave: jest.Mock;
  let sessionsCreate: jest.Mock;
  let likesFindOne: jest.Mock;
  let likesSave: jest.Mock;
  let likesCreate: jest.Mock;
  let likesSoftDelete: jest.Mock;
  let viewsFindOne: jest.Mock;
  let viewsSave: jest.Mock;
  let viewsCreate: jest.Mock;
  let productsFindOne: jest.Mock;
  let service: FeedSessionService;

  beforeEach(() => {
    sessionsFindOne = jest.fn();
    sessionsSave = jest.fn((entity: object) => Promise.resolve({ id: 'new-session', ...entity }));
    sessionsCreate = jest.fn((entity: object) => entity);
    likesFindOne = jest.fn();
    likesSave = jest.fn((entity: object) => Promise.resolve(entity));
    likesCreate = jest.fn((entity: object) => entity);
    likesSoftDelete = jest.fn().mockResolvedValue({ affected: 1 });
    viewsFindOne = jest.fn().mockResolvedValue(null);
    viewsSave = jest.fn((entity: object) => Promise.resolve(entity));
    viewsCreate = jest.fn((entity: object) => entity);
    productsFindOne = jest.fn().mockResolvedValue({ id: 'product-1' });

    const sessionsRepository = {
      findOne: sessionsFindOne,
      save: sessionsSave,
      create: sessionsCreate,
    } as unknown as Repository<FeedSession>;
    const likesRepository = {
      findOne: likesFindOne,
      save: likesSave,
      create: likesCreate,
      softDelete: likesSoftDelete,
    } as unknown as Repository<FeedSessionLike>;
    const viewsRepository = {
      findOne: viewsFindOne,
      save: viewsSave,
      create: viewsCreate,
    } as unknown as Repository<FeedSessionView>;
    const productsRepository = { findOne: productsFindOne } as unknown as Repository<Product>;

    service = new FeedSessionService(
      sessionsRepository,
      likesRepository,
      viewsRepository,
      productsRepository,
    );
  });

  it('resumes a live session and refreshes its expiry', async () => {
    const future = new Date(Date.now() + 60_000);
    sessionsFindOne.mockResolvedValue({ id: 'session-1', expiresAt: future });

    const result = await service.resolveOrCreateSession('session-1');

    expect(result.id).toBe('session-1');
    expect(sessionsSave).toHaveBeenCalled();
    expect(sessionsCreate).not.toHaveBeenCalled();
  });

  it('starts a fresh session when the existing session has expired', async () => {
    const past = new Date(Date.now() - 60_000);
    sessionsFindOne.mockResolvedValue({ id: 'session-old', expiresAt: past });

    const result = await service.resolveOrCreateSession('session-old');

    expect(result.id).toBe('new-session');
    expect(sessionsCreate).toHaveBeenCalled();
  });

  it('starts a fresh session when no session id is provided', async () => {
    const result = await service.resolveOrCreateSession();

    expect(result.id).toBe('new-session');
    expect(sessionsFindOne).not.toHaveBeenCalled();
  });

  it('createFreshSession always mints a new session', async () => {
    const result = await service.createFreshSession();

    expect(result.id).toBe('new-session');
    expect(sessionsFindOne).not.toHaveBeenCalled();
    expect(sessionsCreate).toHaveBeenCalled();
  });

  it('creates a like when none exists', async () => {
    likesFindOne.mockResolvedValue(null);

    await service.like('session-1', 'product-1');

    expect(likesCreate).toHaveBeenCalledWith({ sessionId: 'session-1', productId: 'product-1' });
    expect(likesSave).toHaveBeenCalled();
  });

  it('restores a soft-deleted like instead of creating a duplicate', async () => {
    likesFindOne.mockResolvedValue({ id: 'like-1', deletedAt: new Date() });

    await service.like('session-1', 'product-1');

    expect(likesCreate).not.toHaveBeenCalled();
    expect(likesSave).toHaveBeenCalledWith(expect.objectContaining({ deletedAt: null }));
  });

  it('throws when liking a product that does not exist', async () => {
    productsFindOne.mockResolvedValue(null);

    await expect(service.like('session-1', 'ghost')).rejects.toBeInstanceOf(FeedProductNotFoundException);
  });

  it('soft-deletes the active like on unlike', async () => {
    await service.unlike('session-1', 'product-1');

    expect(likesSoftDelete).toHaveBeenCalledWith(
      expect.objectContaining({ sessionId: 'session-1', productId: 'product-1' }),
    );
  });

  it('accumulates dwell when the same product is viewed again in one session', async () => {
    viewsFindOne.mockResolvedValue({
      sessionId: 'session-1',
      productId: 'product-1',
      dwellMs: 1_500,
      filters: null,
    });

    await service.recordView('session-1', {
      productId: 'product-1',
      dwellMs: 2_000,
      filters: { category: ['snacks'] },
    });

    expect(viewsCreate).not.toHaveBeenCalled();
    expect(viewsSave).toHaveBeenCalledWith(
      expect.objectContaining({
        dwellMs: 3_500,
        filters: { category: ['snacks'] },
      }),
    );
  });

  it('creates a view row on first sight of a product', async () => {
    await service.recordView('session-1', {
      productId: 'product-1',
      dwellMs: 800,
      filters: null,
    });

    expect(viewsCreate).toHaveBeenCalledWith({
      sessionId: 'session-1',
      productId: 'product-1',
      dwellMs: 800,
      filters: null,
    });
    expect(viewsSave).toHaveBeenCalled();
  });
});
