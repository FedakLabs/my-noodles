import type { Repository } from 'typeorm';

import { type FeedCommentsService, FeedService, type FeedSessionService } from '@/application/feed';
import type { Product } from '@/application/products';
import type { VisitorSession } from '@/application/visitor/visitor-session.entity';
import { LocaleContext, LocalizedString } from '@/infrastructure/i18n';

import { jest } from '../jest-globals';

function makeProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 'product-1',
    slug: 'fire-ramen',
    name: new LocalizedString({ uk: 'Вогняний рамен', en: 'Fire Ramen' }),
    priceMinor: 12_900,
    currency: 'UAH',
    images: ['https://img/1.jpg'],
    videos: [],
    quantity: 5,
    sortWeight: 10,
    category: { slug: 'noodles', name: new LocalizedString({ uk: 'Локшина', en: 'Noodles' }) },
    country: { slug: 'south-korea', code: 'KR', name: new LocalizedString({ uk: 'Корея', en: 'Korea' }) },
    brand: { slug: 'samyang', name: 'Samyang' },
    ...overrides,
  } as unknown as Product;
}

describe('FeedService', () => {
  let productsFind: jest.Mock;
  let recordView: jest.Mock;
  let getViewedProductIds: jest.Mock;
  let getLikedProducts: jest.Mock;
  let countForProduct: jest.Mock;
  let service: FeedService;

  const visitor = { id: 'session-1' } as VisitorSession;

  beforeEach(() => {
    productsFind = jest.fn().mockResolvedValue([makeProduct()]);
    recordView = jest.fn().mockResolvedValue(undefined);
    getViewedProductIds = jest.fn().mockResolvedValue([]);
    getLikedProducts = jest.fn().mockResolvedValue([]);
    countForProduct = jest.fn().mockResolvedValue(2);

    const productsRepository = { find: productsFind } as unknown as Repository<Product>;
    const sessionService = {
      recordView,
      getViewedProductIds,
      getLikedProducts,
    } as unknown as FeedSessionService;
    const commentsService = { countForProduct } as unknown as FeedCommentsService;

    service = new FeedService(productsRepository, sessionService, commentsService);
  });

  it('records the previous product view with dwell + filter context before picking next', async () => {
    await LocaleContext.run('uk', () =>
      service.next(visitor, {
        previousProduct: { id: 'previous-1', viewTime: 4_200 },
        filters: { category: ['noodles'] },
      }),
    );

    expect(recordView).toHaveBeenCalledWith('session-1', {
      productId: 'previous-1',
      dwellMs: 4_200,
      filters: { category: ['noodles'] },
    });
  });

  it('excludes already-viewed products and hard-filters by the body filters', async () => {
    getViewedProductIds.mockResolvedValue(['seen-1', 'seen-2']);

    await LocaleContext.run('uk', () => service.next(visitor, { filters: { country: ['south-korea'] } }));

    const calls = productsFind.mock.calls as Array<[{ where?: Record<string, unknown> }]>;
    const where = calls[0]?.[0]?.where ?? {};
    expect(where.id).toBeDefined();
    expect(where.country).toBeDefined();
  });

  it('returns an exhausted response when no candidates remain', async () => {
    productsFind.mockResolvedValue([]);

    const result = await LocaleContext.run('uk', () => service.next(visitor, {}));

    expect(result).toEqual({ item: null, exhausted: true });
  });

  it('maps a localized item and marks it liked when the session liked it', async () => {
    getLikedProducts.mockResolvedValue([makeProduct({ id: 'product-1' })]);

    const result = await LocaleContext.run('en', () => service.next(visitor, {}));

    expect(result.exhausted).toBe(false);
    expect(result.item?.name).toBe('Fire Ramen');
    expect(result.item?.country.name).toBe('Korea');
    expect(result.item?.commentCount).toBe(2);
    expect(result.item?.liked).toBe(true);
  });

  it('does not record a view when there is no previous product', async () => {
    await LocaleContext.run('uk', () => service.next(visitor, {}));

    expect(recordView).not.toHaveBeenCalled();
  });

  it('returns the first candidate in stable sortWeight order', async () => {
    await LocaleContext.run('uk', () => service.next(visitor, {}));

    expect(productsFind).toHaveBeenCalledWith(
      expect.objectContaining({
        order: { sortWeight: 'DESC', createdAt: 'DESC' },
        take: 1,
      }),
    );
  });

  it('picks the highest sortWeight product without affinity scoring', async () => {
    const topPick = makeProduct({
      id: 'top-pick',
      slug: 'top-pick',
      sortWeight: 70,
      category: {
        slug: 'drinks',
        name: new LocalizedString({ uk: 'Напої', en: 'Drinks' }),
      } as Product['category'],
    });
    const lowerPick = makeProduct({
      id: 'lower-pick',
      slug: 'lower-pick',
      sortWeight: 5,
      category: {
        slug: 'noodles',
        name: new LocalizedString({ uk: 'Локшина', en: 'Noodles' }),
      } as Product['category'],
    });

    productsFind.mockResolvedValue([topPick]);
    getLikedProducts.mockResolvedValue([
      makeProduct({
        category: {
          slug: 'noodles',
          name: new LocalizedString({ uk: 'Локшина', en: 'Noodles' }),
        } as Product['category'],
      }),
    ]);

    const result = await LocaleContext.run('uk', () => service.next(visitor, {}));

    expect(result.item?.id).toBe('top-pick');
    expect(lowerPick.id).not.toBe(result.item?.id);
  });
});
