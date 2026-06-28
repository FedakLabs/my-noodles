import { ApiError } from '@my-noodles/api-clients/storefront';

export type ApiErrorCode =
  | 'cart_product_out_of_stock'
  | 'cart_max_quantity_reached'
  | 'cart_inventory_changed'
  | 'cart_empty'
  | 'checkout_expired'
  | 'checkout_not_in_progress'
  | 'order_inventory_changed';

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function getApiErrorCode(error: unknown): ApiErrorCode | undefined {
  if (!isApiError(error) || !error.code) {
    return undefined;
  }

  return error.code as ApiErrorCode;
}

export function getApiErrorPayload(error: unknown): unknown {
  if (!isApiError(error)) {
    return undefined;
  }

  return error.payload;
}

export function isApiConflict(error: unknown): boolean {
  return isApiError(error) && error.status === 409;
}
