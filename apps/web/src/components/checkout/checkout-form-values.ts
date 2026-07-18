import { type Checkout, DeliveryMethod, DeliveryProvider } from '@my-noodles/api-clients/storefront';

import { type CheckoutFormData, toSubmitDeliveryDto } from './validation';

export function checkoutToFormValues(checkout: Checkout): CheckoutFormData {
  const { delivery } = checkout.order;
  return {
    firstName: checkout.order.firstName ?? '',
    lastName: checkout.order.lastName ?? '',
    phone: checkout.order.phone ?? '',
    method: delivery?.method ?? DeliveryMethod.WAREHOUSE,
    provider: delivery?.provider ?? DeliveryProvider.NOVA_POSHTA,
    cityName: delivery?.city ?? '',
    cityRef: delivery?.cityRef ?? '',
    warehouseRef: delivery?.warehouseRef ?? '',
    warehouseName: delivery?.warehouseName ?? '',
    warehouseNumber: delivery?.warehouseNumber ?? '',
    street: delivery?.street ?? '',
    building: delivery?.building ?? '',
    apartment: delivery?.apartment ?? '',
    notes: delivery?.notes ?? '',
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
