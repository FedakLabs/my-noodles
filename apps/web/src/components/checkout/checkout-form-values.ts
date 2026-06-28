import { type CheckoutDetailDto, DeliveryMethod, DeliveryProvider } from '@my-noodles/api-clients/storefront';

import { type CheckoutFormData, toSubmitDeliveryDto } from './validation';

export function checkoutToFormValues(checkout: CheckoutDetailDto): CheckoutFormData {
  return {
    firstName: checkout.firstName ?? '',
    lastName: checkout.lastName ?? '',
    phone: checkout.phone ?? '',
    method: checkout.delivery?.method ?? DeliveryMethod.WAREHOUSE,
    provider: checkout.delivery?.provider ?? DeliveryProvider.NOVA_POSHTA,
    cityName: checkout.delivery?.city ?? '',
    cityRef: checkout.delivery?.cityRef ?? '',
    warehouseRef: checkout.delivery?.warehouseRef ?? '',
    warehouseName: checkout.delivery?.warehouseName ?? '',
    warehouseNumber: checkout.delivery?.warehouseNumber ?? '',
    street: checkout.delivery?.street ?? '',
    building: checkout.delivery?.building ?? '',
    apartment: checkout.delivery?.apartment ?? '',
    notes: checkout.delivery?.notes ?? '',
  };
}

export function formValuesToSubmitCheckout(values: CheckoutFormData) {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    phone: values.phone,
    delivery: toSubmitDeliveryDto(values),
  };
}
