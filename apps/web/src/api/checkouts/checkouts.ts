import {
  type Checkout,
  CheckoutStatus,
  checkoutsControllerCancelCheckout,
  checkoutsControllerGetCheckout,
  checkoutsControllerListCheckouts,
  checkoutsControllerStartCheckout,
  checkoutsControllerSubmitCheckout,
  checkoutsControllerUpdateCheckoutDelivery,
  checkoutsControllerUpdateCheckoutReceiver,
  type Order,
  type SubmitCheckoutDto,
  type UpdateCheckoutDeliveryDto,
  type UpdateCheckoutReceiverDto,
} from '@my-noodles/api-clients/storefront';
import { requestData } from '@my-noodles/web-lib/react-query';
import { queryOptions } from '@tanstack/react-query';

export { CheckoutStatus };

export type { Checkout, Order, SubmitCheckoutDto, UpdateCheckoutDeliveryDto, UpdateCheckoutReceiverDto };

export type ListCheckoutsParams = {
  status?: CheckoutStatus;
};

export const checkoutsQueryKeys = {
  all: ['checkouts'] as const,
  list: (params?: ListCheckoutsParams) => [...checkoutsQueryKeys.all, 'list', params ?? {}] as const,
  detail: (checkoutId: string) => [...checkoutsQueryKeys.all, checkoutId] as const,
};

export async function fetchCheckouts(params?: ListCheckoutsParams): Promise<Checkout[]> {
  return await requestData(
    checkoutsControllerListCheckouts({
      query: params?.status ? { status: params.status } : undefined,
    }),
  );
}

export async function startCheckout(): Promise<Checkout> {
  return await requestData(checkoutsControllerStartCheckout());
}

export async function fetchCheckout(checkoutId: string): Promise<Checkout> {
  return await requestData(checkoutsControllerGetCheckout({ path: { id: checkoutId } }));
}

export async function updateCheckoutReceiver(
  checkoutId: string,
  body: UpdateCheckoutReceiverDto,
): Promise<Checkout> {
  return await requestData(checkoutsControllerUpdateCheckoutReceiver({ path: { id: checkoutId }, body }));
}

export async function updateCheckoutDelivery(
  checkoutId: string,
  body: UpdateCheckoutDeliveryDto,
): Promise<Checkout> {
  return await requestData(checkoutsControllerUpdateCheckoutDelivery({ path: { id: checkoutId }, body }));
}

export async function submitCheckout(checkoutId: string, body: SubmitCheckoutDto): Promise<Order> {
  return await requestData(checkoutsControllerSubmitCheckout({ path: { id: checkoutId }, body }));
}

export async function cancelCheckout(checkoutId: string): Promise<Checkout> {
  return await requestData(
    checkoutsControllerCancelCheckout({
      path: { id: checkoutId },
      body: { reason: 'user' },
    }),
  );
}

export const checkoutsQueries = {
  list: (params?: ListCheckoutsParams) =>
    queryOptions({
      queryKey: checkoutsQueryKeys.list(params),
      queryFn: () => fetchCheckouts(params),
    }),
  detail: (checkoutId: string) =>
    queryOptions({
      queryKey: checkoutsQueryKeys.detail(checkoutId),
      queryFn: () => fetchCheckout(checkoutId),
    }),
};
