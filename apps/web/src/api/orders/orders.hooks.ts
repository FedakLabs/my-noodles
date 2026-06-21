'use client';

import { formatUseMutation } from '@my-noodles/web-lib/react-query';
import { useMutation } from '@tanstack/react-query';

import { createOrder } from './orders';

export function useCreateOrder() {
  return formatUseMutation(
    useMutation({
      mutationFn: createOrder,
    }),
    'createOrder',
  );
}
