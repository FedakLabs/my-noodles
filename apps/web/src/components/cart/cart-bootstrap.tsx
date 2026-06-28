'use client';

import { useCartQuery } from '@/api/cart';

/** Loads cart + active draft on app mount so the panel and nav badge stay in sync. */
export function CartBootstrap() {
  useCartQuery();
  return null;
}
