'use client';

import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cartQueryKeys } from '@/api/cart';
import { useCartPanelOpen } from '@/hooks/cart';
import { isApiConflict } from '@/shared/api-error';

import {
  cancelCheckout,
  CheckoutStatus,
  checkoutsQueries,
  checkoutsQueryKeys,
  startCheckout,
  submitCheckout,
  updateCheckoutDelivery,
  updateCheckoutReceiver,
} from './checkouts';
import type {
  ListCheckoutsParams,
  SubmitCheckoutDto,
  UpdateCheckoutDeliveryDto,
  UpdateCheckoutReceiverDto,
} from './types';

const inProgressListParams = {
  status: CheckoutStatus.IN_PROGRESS,
} as const satisfies ListCheckoutsParams;

export function useCheckoutsList(params?: ListCheckoutsParams, enabled = true) {
  return formatUseQuery(
    useQuery({
      ...checkoutsQueries.list(params),
      enabled,
    }),
    'checkouts',
  );
}

export function useInProgressCheckouts() {
  const panelOpen = useCartPanelOpen();
  const query = useCheckoutsList(inProgressListParams, panelOpen);

  return {
    ...query,
    checkouts: query.checkouts ?? [],
  };
}

export function useCheckout(checkoutId: string) {
  return formatUseQuery(useQuery(checkoutsQueries.detail(checkoutId)), 'checkout');
}

export function useStartCheckout() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      mutationFn: startCheckout,
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() }),
          queryClient.invalidateQueries({ queryKey: checkoutsQueryKeys.list(inProgressListParams) }),
        ]);
      },
      onError: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() }),
          queryClient.invalidateQueries({ queryKey: checkoutsQueryKeys.list(inProgressListParams) }),
        ]);
      },
    }),
    'startCheckout',
  );
}

export function useUpdateCheckoutReceiver(checkoutId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      mutationFn: (body: UpdateCheckoutReceiverDto) => updateCheckoutReceiver(checkoutId, body),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: checkoutsQueryKeys.detail(checkoutId) });
      },
    }),
    'updateCheckoutReceiver',
  );
}

export function useUpdateCheckoutDelivery(checkoutId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      mutationFn: (body: UpdateCheckoutDeliveryDto) => updateCheckoutDelivery(checkoutId, body),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: checkoutsQueryKeys.detail(checkoutId) });
      },
    }),
    'updateCheckoutDelivery',
  );
}

export function useSubmitCheckout(checkoutId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      mutationFn: (body: SubmitCheckoutDto) => submitCheckout(checkoutId, body),
      onError: async (error) => {
        if (isApiConflict(error)) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: checkoutsQueryKeys.detail(checkoutId) }),
            queryClient.invalidateQueries({ queryKey: checkoutsQueryKeys.list(inProgressListParams) }),
          ]);
        }
      },
    }),
    'submitCheckout',
  );
}

export function useCancelCheckout() {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      mutationFn: cancelCheckout,
      onSuccess: async (_checkout, checkoutId) => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cartQueryKeys.all() }),
          queryClient.invalidateQueries({ queryKey: checkoutsQueryKeys.detail(checkoutId) }),
          queryClient.invalidateQueries({ queryKey: checkoutsQueryKeys.list(inProgressListParams) }),
        ]);
      },
    }),
    'cancelCheckout',
  );
}
