import {
  CartMaxQuantityReachedException,
  CartProductNotFoundException,
  CartProductOutOfStockException,
} from '@/application/cart/cart.exceptions';
import { CartService } from '@/application/cart/cart.service';
import type { InventoryService } from '@/application/inventory/inventory.service';
import type { VisitorSession } from '@/application/visitor-session/visitor-session.entity';

import { jest } from '../jest-globals';

describe('CartService.addItemsBatch', () => {
  let cartItemsFind: jest.Mock;
  let cartItemsFindOne: jest.Mock;
  let cartItemsSave: jest.Mock;
  let cartItemsCreate: jest.Mock;
  let productsFind: jest.Mock;
  let getAvailableQtyBatch: jest.Mock;
  let service: CartService;

  const visitor = { id: 'visitor-1' } as VisitorSession;

  beforeEach(() => {
    cartItemsFind = jest.fn();
    cartItemsFindOne = jest.fn();
    cartItemsSave = jest.fn((entity: object) => Promise.resolve(entity));
    cartItemsCreate = jest.fn((entity: object) => entity);
    productsFind = jest.fn();
    getAvailableQtyBatch = jest.fn();

    const dataSource = {
      transaction: jest.fn(async (work: (manager: object) => Promise<unknown>) => await work({})),
      manager: {},
    };

    service = new CartService(
      dataSource as never,
      {
        find: cartItemsFind,
        findOne: cartItemsFindOne,
        save: cartItemsSave,
        create: cartItemsCreate,
      } as never,
      { find: productsFind } as never,
      { getAvailableQtyBatch } as unknown as InventoryService,
    );
  });

  it('adds multiple products in one transaction', async () => {
    productsFind.mockResolvedValue([{ id: 'product-1' }, { id: 'product-2' }]);
    getAvailableQtyBatch.mockResolvedValue(
      new Map([
        ['product-1', 5],
        ['product-2', 3],
      ]),
    );
    cartItemsFind.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        productId: 'product-1',
        qty: 1,
        product: { priceMinor: 1000, currency: 'UAH' },
      },
      {
        productId: 'product-2',
        qty: 2,
        product: { priceMinor: 2000, currency: 'UAH' },
      },
    ]);

    const result = await service.addItemsBatch(visitor, [
      { productId: 'product-1', qty: 1 },
      { productId: 'product-2', qty: 2 },
    ]);

    expect(cartItemsSave).toHaveBeenCalledTimes(2);
    expect(result.itemCount).toBe(3);
    expect(result.totalMinor).toBe(5000);
  });

  it('merges duplicate productIds by summing qty', async () => {
    productsFind.mockResolvedValue([{ id: 'product-1' }]);
    getAvailableQtyBatch.mockResolvedValue(new Map([['product-1', 10]]));
    cartItemsFind.mockResolvedValueOnce([]).mockResolvedValueOnce([
      {
        productId: 'product-1',
        qty: 3,
        product: { priceMinor: 1000, currency: 'UAH' },
      },
    ]);

    await service.addItemsBatch(visitor, [
      { productId: 'product-1', qty: 1 },
      { productId: 'product-1', qty: 2 },
    ]);

    expect(cartItemsCreate).toHaveBeenCalledWith({
      visitorSessionId: 'visitor-1',
      productId: 'product-1',
      qty: 3,
    });
    expect(cartItemsSave).toHaveBeenCalledTimes(1);
  });

  it('throws not found before writing when a product is missing', async () => {
    productsFind.mockResolvedValue([{ id: 'product-1' }]);

    await expect(
      service.addItemsBatch(visitor, [{ productId: 'product-1' }, { productId: 'product-missing' }]),
    ).rejects.toBeInstanceOf(CartProductNotFoundException);

    expect(getAvailableQtyBatch).not.toHaveBeenCalled();
    expect(cartItemsSave).not.toHaveBeenCalled();
  });

  it('writes nothing when a later line is out of stock', async () => {
    productsFind.mockResolvedValue([{ id: 'product-1' }, { id: 'product-2' }]);
    getAvailableQtyBatch.mockResolvedValue(
      new Map([
        ['product-1', 5],
        ['product-2', 0],
      ]),
    );
    cartItemsFind.mockResolvedValue([]);

    await expect(
      service.addItemsBatch(visitor, [{ productId: 'product-1' }, { productId: 'product-2' }]),
    ).rejects.toBeInstanceOf(CartProductOutOfStockException);

    expect(cartItemsSave).not.toHaveBeenCalled();
  });

  it('rejects when merged qty exceeds available stock', async () => {
    productsFind.mockResolvedValue([{ id: 'product-1' }]);
    getAvailableQtyBatch.mockResolvedValue(new Map([['product-1', 2]]));
    cartItemsFind.mockResolvedValue([
      {
        productId: 'product-1',
        qty: 2,
        product: { priceMinor: 1000, currency: 'UAH' },
      },
    ]);

    await expect(service.addItemsBatch(visitor, [{ productId: 'product-1', qty: 1 }])).rejects.toBeInstanceOf(
      CartMaxQuantityReachedException,
    );

    expect(cartItemsSave).not.toHaveBeenCalled();
  });
});
