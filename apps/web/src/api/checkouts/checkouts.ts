import {
  type CheckoutDetailDto,
  checkoutsControllerCancelCheckout,
  checkoutsControllerGetCheckout,
  checkoutsControllerListCheckouts,
  checkoutsControllerStartCheckout,
  checkoutsControllerSubmitCheckout,
  checkoutsControllerUpdateCheckoutDelivery,
  checkoutsControllerUpdateCheckoutReceiver,
  type CheckoutsListDto,
  type CheckoutStartDto,
  type CheckoutSummaryDto,
  type OrderResponseDto,
  type SubmitCheckoutDto,
  type UpdateCheckoutDeliveryDto,
  type UpdateCheckoutReceiverDto,
} from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';

export { mergeCheckoutDetail } from './checkout-merge';

export type {
  CheckoutDetailDto,
  CheckoutsListDto,
  CheckoutStartDto,
  CheckoutSummaryDto,
  OrderResponseDto,
  SubmitCheckoutDto,
  UpdateCheckoutDeliveryDto,
  UpdateCheckoutReceiverDto,
};

export type ListCheckoutsParams = {
  status?: 'in_progress' | 'completed' | 'cancelled';
};

export const checkoutsQueryKeys = {
  all: ['checkouts'] as const,
  list: (params?: ListCheckoutsParams) => [...checkoutsQueryKeys.all, 'list', params ?? {}] as const,
  detail: (checkoutId: string) => [...checkoutsQueryKeys.all, checkoutId] as const,
};

export async function fetchCheckouts(params?: ListCheckoutsParams): Promise<CheckoutsListDto> {
  return requestData(
    checkoutsControllerListCheckouts({
      query: params?.status ? { status: params.status } : undefined,
    }),
  );
}

export async function startCheckout(): Promise<CheckoutStartDto> {
  return requestData(checkoutsControllerStartCheckout());
}

export async function fetchCheckout(checkoutId: string): Promise<CheckoutDetailDto> {
  return requestData(checkoutsControllerGetCheckout({ path: { id: checkoutId } }));
}

export async function updateCheckoutReceiver(
  checkoutId: string,
  body: UpdateCheckoutReceiverDto,
): Promise<CheckoutDetailDto> {
  return requestData(checkoutsControllerUpdateCheckoutReceiver({ path: { id: checkoutId }, body }));
}

export async function updateCheckoutDelivery(
  checkoutId: string,
  body: UpdateCheckoutDeliveryDto,
): Promise<CheckoutDetailDto> {
  return requestData(checkoutsControllerUpdateCheckoutDelivery({ path: { id: checkoutId }, body }));
}

export async function submitCheckout(checkoutId: string, body: SubmitCheckoutDto): Promise<OrderResponseDto> {
  return requestData(checkoutsControllerSubmitCheckout({ path: { id: checkoutId }, body }));
}

export async function cancelCheckout(checkoutId: string): Promise<CheckoutDetailDto> {
  return requestData(checkoutsControllerCancelCheckout({ path: { id: checkoutId } }));
}
