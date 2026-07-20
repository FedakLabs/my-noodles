import { DeliveryMethod } from '@my-noodles/api-clients/storefront';
import type { UseFormSetValue } from 'react-hook-form';

import type { CheckoutFormData } from './validation';

export type CheckoutDeliveryEstimateInput = {
  method: DeliveryMethod;
  cityName: string;
  warehouseRef: string;
  warehouseNumber: string;
  street: string;
  building: string;
};

export function canEstimateCheckoutDelivery(values: CheckoutDeliveryEstimateInput): boolean {
  if (!values.cityName.trim()) {
    return false;
  }

  if (values.method === DeliveryMethod.CUSTOM) {
    return true;
  }

  if (values.method === DeliveryMethod.WAREHOUSE) {
    return Boolean(values.warehouseRef.trim() || values.warehouseNumber.trim());
  }

  return Boolean(values.street.trim() && values.building.trim());
}

export function isCheckoutDeliveryEstimateLoading(
  deliveryEstimateIsPending: boolean,
  values: CheckoutDeliveryEstimateInput,
): boolean {
  return deliveryEstimateIsPending && canEstimateCheckoutDelivery(values);
}

function clearCityFields(setValue: UseFormSetValue<CheckoutFormData>) {
  setValue('cityRef', '');
  setValue('cityName', '');
}

function clearWarehouseFields(setValue: UseFormSetValue<CheckoutFormData>) {
  setValue('warehouseRef', '');
  setValue('warehouseName', '');
  setValue('warehouseNumber', '');
}

function clearCourierFields(setValue: UseFormSetValue<CheckoutFormData>) {
  setValue('street', '');
  setValue('building', '');
  setValue('apartment', '');
}

function clearAddressFields(setValue: UseFormSetValue<CheckoutFormData>) {
  clearWarehouseFields(setValue);
  clearCourierFields(setValue);
  setValue('postalCode', '');
  setValue('notes', '');
}

export function resetAfterProviderChange(
  setValue: UseFormSetValue<CheckoutFormData>,
  nextMethod: DeliveryMethod = DeliveryMethod.WAREHOUSE,
) {
  setValue('method', nextMethod);
  clearCityFields(setValue);
  clearAddressFields(setValue);
}

export function resetAfterMethodChange(setValue: UseFormSetValue<CheckoutFormData>) {
  clearCityFields(setValue);
  clearAddressFields(setValue);
}

export function resetAfterCityChange(setValue: UseFormSetValue<CheckoutFormData>) {
  clearAddressFields(setValue);
}

export function deliveryAutocompleteEmptyText({
  input,
  isError,
  startTyping,
  notFound,
  error,
  minLength = 1,
}: {
  input: string;
  isError: boolean;
  startTyping: string;
  notFound: (query: string) => string;
  error: string;
  minLength?: number;
}): string {
  if (isError) {
    return error;
  }

  const trimmed = input.trim();
  if (trimmed.length < minLength) {
    return startTyping;
  }

  return notFound(trimmed);
}
