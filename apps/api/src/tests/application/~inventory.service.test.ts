import { CheckoutStatus } from '@/application/checkouts/checkout-status';
import { InventoryService } from '@/application/inventory/inventory.service';
import { OrderInventoryChangedException } from '@/application/orders/orders.exceptions';

import { jest } from '../jest-globals';

describe('InventoryService', () => {
  let productsFindOne: jest.Mock;
  let productsFind: jest.Mock;
  let productsSave: jest.Mock;
  let productsExecute: jest.Mock;
  let orderItemsFind: jest.Mock;
  let service: InventoryService;

  beforeEach(() => {
    productsFindOne = jest.fn();
    productsFind = jest.fn();
    productsSave = jest.fn();
    productsExecute = jest.fn().mockResolvedValue({ affected: 1 });
    orderItemsFind = jest.fn();

    service = new InventoryService(
      {
        findOne: productsFindOne,
        find: productsFind,
        save: productsSave,
        createQueryBuilder: jest.fn().mockReturnValue({
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          execute: productsExecute,
        }),
      } as never,
      { find: orderItemsFind } as never,
    );
  });

  it('returns available quantity minus in_progress checkout reservations', async () => {
    productsFindOne.mockResolvedValue({ id: 'product-1', quantity: 10 });
    orderItemsFind.mockResolvedValue([{ productId: 'product-1', qty: 3 }]);

    await expect(service.getAvailableQty('product-1')).resolves.toBe(7);
  });

  it('returns gross product quantity for submit reconciliation', async () => {
    productsFind.mockResolvedValue([{ id: 'product-1', quantity: 5 }]);

    const result = await service.getGrossQtyBatch(['product-1']);

    expect(result.get('product-1')).toBe(5);
    expect(orderItemsFind).not.toHaveBeenCalled();
  });

  it('clamps reconcile lines to available stock', () => {
    const lines = [{ productId: 'product-1', qty: 3 }];

    const result = service.reconcileLines(lines, new Map([['product-1', 2]]));

    expect(result).toEqual({ changed: true });
    expect(lines).toEqual([{ productId: 'product-1', qty: 2 }]);
  });

  it('deducts gross quantity on submit atomically', async () => {
    await service.deductOnSubmit([{ productId: 'product-1', qty: 2 }]);

    expect(productsExecute).toHaveBeenCalled();
    expect(productsSave).not.toHaveBeenCalled();
  });

  it('rejects submit deduct when atomic update affects no rows', async () => {
    productsExecute.mockResolvedValueOnce({ affected: 0 });

    await expect(service.deductOnSubmit([{ productId: 'product-1', qty: 2 }])).rejects.toBeInstanceOf(
      OrderInventoryChangedException,
    );
  });

  it('restores gross quantity on manager cancel', async () => {
    const product = { id: 'product-1', quantity: 3 };
    productsFindOne.mockResolvedValue(product);
    productsSave.mockResolvedValue(product);

    await service.restoreOnCancel([{ productId: 'product-1', qty: 2 }]);

    expect(product.quantity).toBe(5);
    expect(productsSave).toHaveBeenCalledWith(product);
  });

  it('filters reservations by in_progress checkout status only', async () => {
    productsFindOne.mockResolvedValue({ id: 'product-1', quantity: 4 });
    orderItemsFind.mockResolvedValue([]);

    await service.getAvailableQty('product-1');

    const [findOptions] = orderItemsFind.mock.calls[0] as [
      { where: { order: { checkout: { status: CheckoutStatus } } } },
    ];

    expect(findOptions.where.order.checkout.status).toBe(CheckoutStatus.InProgress);
  });
});
