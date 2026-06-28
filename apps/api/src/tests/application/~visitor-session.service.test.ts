import type { Repository } from 'typeorm';

import { type CartItem } from '@/application/cart/cart-item.entity';
import { type FeedSessionView } from '@/application/feed/feed-session-view.entity';
import { type VisitorSession, VisitorSessionService } from '@/application/visitor';

import { jest } from '../jest-globals';

describe('VisitorSessionService', () => {
  let visitorsFindOne: jest.Mock;
  let visitorsSave: jest.Mock;
  let visitorsCreate: jest.Mock;
  let viewsDelete: jest.Mock;
  let cartItemsDelete: jest.Mock;
  let service: VisitorSessionService;

  beforeEach(() => {
    visitorsFindOne = jest.fn();
    visitorsSave = jest.fn((entity: object) => Promise.resolve({ id: 'new-visitor', ...entity }));
    visitorsCreate = jest.fn((entity: object) => entity);
    viewsDelete = jest.fn().mockResolvedValue({ affected: 1 });
    cartItemsDelete = jest.fn().mockResolvedValue({ affected: 0 });

    service = new VisitorSessionService(
      {
        findOne: visitorsFindOne,
        save: visitorsSave,
        create: visitorsCreate,
      } as unknown as Repository<VisitorSession>,
      { delete: viewsDelete } as unknown as Repository<FeedSessionView>,
      { delete: cartItemsDelete } as unknown as Repository<CartItem>,
    );
  });

  it('returns an existing visitor when the cookie id is valid', async () => {
    const visitor = { id: 'visitor-1', feedExpiresAt: new Date(), cartExpiresAt: new Date() };
    visitorsFindOne.mockResolvedValue(visitor);

    const result = await service.resolve('visitor-1');

    expect(result.id).toBe('visitor-1');
    expect(visitorsCreate).not.toHaveBeenCalled();
  });

  it('clears cart items when cart TTL has lapsed', async () => {
    const past = new Date(Date.now() - 60_000);

    await service.resolveForCart({
      id: 'visitor-1',
      feedExpiresAt: new Date(Date.now() + 60_000),
      cartExpiresAt: past,
    } as VisitorSession);

    expect(cartItemsDelete).toHaveBeenCalledWith({ visitorSessionId: 'visitor-1' });
    expect(visitorsSave).toHaveBeenCalled();
  });
});
