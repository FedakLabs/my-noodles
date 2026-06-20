'use client';

import { useMutation } from '@tanstack/react-query';

import { formatUseMutation } from '../_lib/queries';
import { createOrder } from './orders';

export function useCreateOrder() {
  return formatUseMutation(
    useMutation({
      mutationFn: createOrder,
    }),
    'createOrder',
  );
}
