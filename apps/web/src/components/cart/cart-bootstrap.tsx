'use client';

import { useCartQuery } from '@/api/cart';

export function CartBootstrap() {
  useCartQuery();
  return null;
}
