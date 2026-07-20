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

  it('keeps warehouse and address fields for custom delivery', () => {
    const entity = mapDeliveryDtoToEntity('order-1', {
      provider: DeliveryProvider.Ukrposhta,
      method: DeliveryMethod.Custom,
      city: 'Львів',
      postalCode: '79000',
      warehouseNumber: '12',
      warehouseName: 'Відділення №12',
      street: 'Шевченка',
      building: '5',
      apartment: '2',
    });

    expect(entity).toMatchObject({
      provider: DeliveryProvider.Ukrposhta,
      method: DeliveryMethod.Custom,
      city: 'Львів',
      cityRef: null,
      postalCode: '79000',
      warehouseNumber: '12',
      warehouseName: 'Відділення №12',
      warehouseRef: null,
      street: 'Шевченка',
      building: '5',
      apartment: '2',
    });
  });
});
