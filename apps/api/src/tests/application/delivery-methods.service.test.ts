import { LocaleContext } from '@my-noodles/api-lib/locale';

import { DeliveryMethodsService } from '@/application/delivery/delivery-methods.service';
import { DeliveryMethod, DeliveryProvider } from '@/application/orders';

describe('DeliveryMethodsService', () => {
  const service = new DeliveryMethodsService();

  it('lists warehouse, courier, and custom for Nova Poshta and Meest', () => {
    LocaleContext.run('uk', () => {
      expect(service.listForProvider(DeliveryProvider.NovaPoshta)).toEqual([
        { id: DeliveryMethod.Warehouse, label: 'Відділення або поштомат' },
        { id: DeliveryMethod.Courier, label: "Кур'єр" },
        { id: DeliveryMethod.Custom, label: 'Інший спосіб' },
      ]);
      expect(service.listForProvider(DeliveryProvider.Meest)).toEqual([
        { id: DeliveryMethod.Warehouse, label: 'Відділення або поштомат' },
        { id: DeliveryMethod.Courier, label: "Кур'єр" },
        { id: DeliveryMethod.Custom, label: 'Інший спосіб' },
      ]);
    });
  });

  it('lists only custom for Ukrposhta', () => {
    LocaleContext.run('en', () => {
      expect(service.listForProvider(DeliveryProvider.Ukrposhta)).toEqual([
        { id: DeliveryMethod.Custom, label: 'Other arrangement' },
      ]);
    });
  });

  it('reports availability for provider and method pairs', () => {
    expect(service.isAvailableForProvider(DeliveryProvider.NovaPoshta, DeliveryMethod.Warehouse)).toBe(true);
    expect(service.isAvailableForProvider(DeliveryProvider.Ukrposhta, DeliveryMethod.Custom)).toBe(true);
    expect(service.isAvailableForProvider(DeliveryProvider.Ukrposhta, DeliveryMethod.Warehouse)).toBe(false);
    expect(service.isAvailableForProvider(DeliveryProvider.Ukrposhta, DeliveryMethod.Courier)).toBe(false);
  });
});
