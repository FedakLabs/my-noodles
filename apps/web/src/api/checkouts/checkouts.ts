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
import { mutationOptions, queryOptions } from '@tanstack/react-query';

import { withAppLocaleKey } from '@/i18n/app-locale';

export { CheckoutStatus };

export type { Checkout, Order, SubmitCheckoutDto, UpdateCheckoutDeliveryDto, UpdateCheckoutReceiverDto };

export type ListCheckoutsParams = {
  status?: CheckoutStatus;
};

export const checkoutsQueries = {
  rootKey: ['checkouts'] as const,
  /** Locale-prefixed root — for invalidate/remove; do not pass to useQuery. */
  all: () =>
    queryOptions({
      queryKey: withAppLocaleKey(() => checkoutsQueries.rootKey)(),
    }),
  list: (params?: ListCheckoutsParams) =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...checkoutsQueries.rootKey, 'list', params ?? {}] as const)(),
      queryFn: () =>
        checkoutsControllerListCheckouts({
          query: params?.status ? { status: params.status } : undefined,
        }),
    }),
  detail: (checkoutId: string) =>
    queryOptions({
      queryKey: withAppLocaleKey(() => [...checkoutsQueries.rootKey, checkoutId] as const)(),
      queryFn: () => checkoutsControllerGetCheckout({ path: { id: checkoutId } }),
    }),
};

export const checkoutsMutations = {
  rootKey: checkoutsQueries.rootKey,
  start: () =>
    mutationOptions({
      mutationKey: [...checkoutsMutations.rootKey, 'start'] as const,
      mutationFn: () => checkoutsControllerStartCheckout(),
    }),
  updateReceiver: (checkoutId: string) =>
    mutationOptions({
      mutationKey: [...checkoutsMutations.rootKey, 'updateReceiver', checkoutId] as const,
      mutationFn: (body: UpdateCheckoutReceiverDto) =>
        checkoutsControllerUpdateCheckoutReceiver({ path: { id: checkoutId }, body }),
    }),
  updateDelivery: (checkoutId: string) =>
    mutationOptions({
      mutationKey: [...checkoutsMutations.rootKey, 'updateDelivery', checkoutId] as const,
      mutationFn: (body: UpdateCheckoutDeliveryDto) =>
        checkoutsControllerUpdateCheckoutDelivery({ path: { id: checkoutId }, body }),
    }),
  submit: (checkoutId: string) =>
    mutationOptions({
      mutationKey: [...checkoutsMutations.rootKey, 'submit', checkoutId] as const,
      mutationFn: (body: SubmitCheckoutDto) =>
        checkoutsControllerSubmitCheckout({ path: { id: checkoutId }, body }),
    }),
  cancel: () =>
    mutationOptions({
      mutationKey: [...checkoutsMutations.rootKey, 'cancel'] as const,
      mutationFn: (checkoutId: string) =>
        checkoutsControllerCancelCheckout({
          path: { id: checkoutId },
          body: { reason: 'user' },
        }),
    }),
};
