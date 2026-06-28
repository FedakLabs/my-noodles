import type { Repository } from 'typeorm';

import {
  FeedProductNotFoundException,
  type FeedSessionLike,
  FeedSessionService,
  type FeedSessionView,
} from '@/application/feed';
import type { Product } from '@/application/products';

import { jest } from '../jest-globals';

describe('FeedSessionService', () => {
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
    likesFindOne = jest.fn();
    likesSave = jest.fn((entity: object) => Promise.resolve(entity));
    likesCreate = jest.fn((entity: object) => entity);
    likesSoftDelete = jest.fn().mockResolvedValue({ affected: 1 });
    viewsFindOne = jest.fn().mockResolvedValue(null);
    viewsSave = jest.fn((entity: object) => Promise.resolve(entity));
    viewsCreate = jest.fn((entity: object) => entity);
    productsFindOne = jest.fn().mockResolvedValue({ id: 'product-1' });

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

    service = new FeedSessionService(likesRepository, viewsRepository, productsRepository);
  });

  it('creates a like when none exists', async () => {
    likesFindOne.mockResolvedValue(null);

    await service.like('session-1', 'product-1');

    expect(likesCreate).toHaveBeenCalledWith({ visitorSessionId: 'session-1', productId: 'product-1' });
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
      expect.objectContaining({ visitorSessionId: 'session-1', productId: 'product-1' }),
    );
  });

  it('accumulates dwell when the same product is viewed again in one session', async () => {
    viewsFindOne.mockResolvedValue({
      visitorSessionId: 'session-1',
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
      visitorSessionId: 'session-1',
      productId: 'product-1',
      dwellMs: 800,
      filters: null,
    });
    expect(viewsSave).toHaveBeenCalled();
  });
});
