import {
  DeliveryMethod,
  DeliveryProvider,
  HoneypotTriggeredException,
  OrdersController,
} from '@/application/orders';

import { jest } from '../jest-globals';

describe('OrdersController', () => {
  const delivery = {
    provider: DeliveryProvider.NovaPoshta,
    method: DeliveryMethod.Warehouse,
    city: 'Київ',
    warehouseNumber: '1',
    warehouseName: 'Відділення №1',
  };

  it('rejects honeypot submissions before calling the service', () => {
    const create = jest.fn();
    const controller = new OrdersController({ create } as never);

    expect(() =>
      controller.create({
        customerName: 'Bot',
        phone: '+380000000000',
        delivery,
        company: 'Acme Inc',
        items: [{ productId: 'product-1', qty: 1 }],
      }),
    ).toThrow(HoneypotTriggeredException);

    expect(create).not.toHaveBeenCalled();
  });
});
