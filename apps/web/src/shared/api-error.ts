import {
  ApiError,
  type CartControllerAddItemError,
  type CartControllerSetItemQtyError,
  type CheckoutsControllerCancelCheckoutError,
  type CheckoutsControllerGetCheckoutError,
  type CheckoutsControllerStartCheckoutError,
  type CheckoutsControllerSubmitCheckoutError,
  type CheckoutsControllerUpdateCheckoutDeliveryError,
  type CheckoutsControllerUpdateCheckoutReceiverError,
  type OrdersControllerCancelOrderError,
} from '@my-noodles/api-clients/storefront';

type StorefrontApiError =
  | CartControllerAddItemError
  | CartControllerSetItemQtyError
  | CheckoutsControllerStartCheckoutError
  | CheckoutsControllerCancelCheckoutError
  | CheckoutsControllerGetCheckoutError
  | CheckoutsControllerUpdateCheckoutReceiverError
  | CheckoutsControllerUpdateCheckoutDeliveryError
  | CheckoutsControllerSubmitCheckoutError
  | OrdersControllerCancelOrderError;

export type ApiErrorCode = Extract<StorefrontApiError, { code: string }>['code'];

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
