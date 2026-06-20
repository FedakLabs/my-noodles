import { DeliveryMethod, DeliveryProvider, formatOrderDelivery } from '@/application/orders';

describe('formatOrderDelivery', () => {
  it('formats warehouse delivery', () => {
    const summary = formatOrderDelivery({
      provider: DeliveryProvider.NovaPoshta,
      method: DeliveryMethod.Warehouse,
      city: 'Київ',
      warehouseNumber: '1',
      warehouseName: 'Відділення №1',
      street: null,
      building: null,
      apartment: null,
      notes: null,
    });

    expect(summary).toContain('Нова Пошта');
    expect(summary).toContain('відділення');
    expect(summary).toContain('Київ');
    expect(summary).toContain('1');
  });

  it('formats courier delivery', () => {
    const summary = formatOrderDelivery({
      provider: DeliveryProvider.Meest,
      method: DeliveryMethod.Courier,
      city: 'Львів',
      warehouseNumber: null,
      warehouseName: null,
      street: 'вул. Городоцька',
      building: '12',
      apartment: '4',
      notes: 'Дзвонити перед приїздом',
    });

    expect(summary).toContain('Meest');
    expect(summary).toContain("кур'єр");
    expect(summary).toContain('вул. Городоцька');
    expect(summary).toContain('кв. 4');
  });
});
