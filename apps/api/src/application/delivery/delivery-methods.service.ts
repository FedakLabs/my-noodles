import { LocalizedString } from '@my-noodles/api-lib/locale';
import { Injectable } from '@nestjs/common';

import { DeliveryMethod, DeliveryProvider } from '../orders/order-delivery.dto';
import type { DeliveryMethodDto } from './delivery.dto';

const PROVIDER_AVAILABLE_METHODS: Record<DeliveryProvider, DeliveryMethod[]> = {
  [DeliveryProvider.NovaPoshta]: [DeliveryMethod.Warehouse, DeliveryMethod.Courier, DeliveryMethod.Custom],
  [DeliveryProvider.Meest]: [DeliveryMethod.Warehouse, DeliveryMethod.Courier, DeliveryMethod.Custom],
  [DeliveryProvider.Ukrposhta]: [DeliveryMethod.Custom],
};

const METHOD_LABELS: Record<DeliveryMethod, LocalizedString> = {
  [DeliveryMethod.Warehouse]: new LocalizedString({
    uk: 'Відділення або поштомат',
    en: 'Branch or parcel locker',
  }),
  [DeliveryMethod.Courier]: new LocalizedString({ uk: "Кур'єр", en: 'Courier' }),
  [DeliveryMethod.Custom]: new LocalizedString({ uk: 'Інший спосіб', en: 'Other arrangement' }),
};

function localizedLabel(labels: LocalizedString): string {
  return (labels.localized ?? labels.uk) as string;
}

@Injectable()
export class DeliveryMethodsService {
  isAvailableForProvider(provider: DeliveryProvider, method: DeliveryMethod): boolean {
    return PROVIDER_AVAILABLE_METHODS[provider].includes(method);
  }

  listForProvider(provider: DeliveryProvider): DeliveryMethodDto[] {
    return PROVIDER_AVAILABLE_METHODS[provider].map((method) => ({
      id: method,
      label: localizedLabel(METHOD_LABELS[method]),
    }));
  }
}
