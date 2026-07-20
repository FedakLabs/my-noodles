'use client';

import { formatUseMutation, formatUseQuery } from '@my-noodles/web-lib/react-query';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { cartQueries } from '@/api/cart';
import { useCartPanelOpen } from '@/hooks/cart';
import { isApiConflict } from '@/shared/api-error';

import { CheckoutStatus, checkoutsMutations, checkoutsQueries } from './checkouts';
import type { ListCheckoutsParams } from './types';

const activeListParams = {
  status: CheckoutStatus.ACTIVE,
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

export function useActiveCheckouts() {
  const panelOpen = useCartPanelOpen();
  const query = useCheckoutsList(activeListParams, panelOpen);

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
      ...checkoutsMutations.start(),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey }),
          queryClient.invalidateQueries({ queryKey: checkoutsQueries.list(activeListParams).queryKey }),
        ]);
      },
      onError: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey }),
          queryClient.invalidateQueries({ queryKey: checkoutsQueries.list(activeListParams).queryKey }),
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
      ...checkoutsMutations.updateReceiver(checkoutId),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: checkoutsQueries.detail(checkoutId).queryKey });
      },
    }),
    'updateCheckoutReceiver',
  );
}

export function useUpdateCheckoutDelivery(checkoutId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...checkoutsMutations.updateDelivery(checkoutId),
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: checkoutsQueries.detail(checkoutId).queryKey });
      },
    }),
    'updateCheckoutDelivery',
  );
}

export function useSubmitCheckout(checkoutId: string) {
  const queryClient = useQueryClient();

  return formatUseMutation(
    useMutation({
      ...checkoutsMutations.submit(checkoutId),
      onSuccess: async () => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: checkoutsQueries.detail(checkoutId).queryKey }),
          queryClient.invalidateQueries({ queryKey: checkoutsQueries.list(activeListParams).queryKey }),
        ]);
      },
      onError: async (error) => {
        if (isApiConflict(error)) {
          await Promise.all([
            queryClient.invalidateQueries({ queryKey: checkoutsQueries.detail(checkoutId).queryKey }),
            queryClient.invalidateQueries({ queryKey: checkoutsQueries.list(activeListParams).queryKey }),
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
      ...checkoutsMutations.cancel(),
      onSuccess: async (_checkout, checkoutId) => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: cartQueries.all().queryKey }),
          queryClient.invalidateQueries({ queryKey: checkoutsQueries.detail(checkoutId).queryKey }),
          queryClient.invalidateQueries({ queryKey: checkoutsQueries.list(activeListParams).queryKey }),
        ]);
      },
    }),
    'cancelCheckout',
  );
}
