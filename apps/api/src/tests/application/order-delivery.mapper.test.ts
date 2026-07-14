import { DeliveryMethod, DeliveryProvider } from '@/application/orders/order-delivery.dto';
import { mapDeliveryDtoToEntity } from '@/application/orders/order-delivery.mapper';

import { describe, expect, it } from '../jest-globals';

describe('mapDeliveryDtoToEntity', () => {
  it('persists cityRef for courier delivery', () => {
    const entity = mapDeliveryDtoToEntity('order-1', {
      provider: DeliveryProvider.NovaPoshta,
      method: DeliveryMethod.Courier,
      city: 'м. Київ, Київська обл.',
      cityRef: 'settlement-ref',
      street: 'Хрещатик',
      building: '1',
      apartment: '10',
    });

    expect(entity).toMatchObject({
      orderId: 'order-1',
      provider: DeliveryProvider.NovaPoshta,
      method: DeliveryMethod.Courier,
      city: 'м. Київ, Київська обл.',
      cityRef: 'settlement-ref',
      street: 'Хрещатик',
      building: '1',
      apartment: '10',
      warehouseRef: null,
      warehouseNumber: null,
      warehouseName: null,
    });
  });

  it('persists warehouse refs for warehouse delivery', () => {
    const entity = mapDeliveryDtoToEntity('order-1', {
      provider: DeliveryProvider.NovaPoshta,
      method: DeliveryMethod.Warehouse,
      city: 'Київ',
      cityRef: 'city-ref',
      warehouseRef: 'wh-1',
      warehouseNumber: '1',
      warehouseName: 'Відділення №1',
    });

    expect(entity).toMatchObject({
      cityRef: 'city-ref',
      warehouseRef: 'wh-1',
      warehouseNumber: '1',
      warehouseName: 'Відділення №1',
      street: null,
      building: null,
      apartment: null,
    });
  });
});
