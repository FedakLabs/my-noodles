'use client';

import type { ProductDetailDto, ProductSummaryDto } from '@my-noodles/api-clients/storefront';
import { useEffect, useRef } from 'react';

import type { CartLine } from '@/hooks/cart/cart-store';
import type { PurchasePayload } from '@/shared/analytics';
import {
  trackBeginCheckout,
  trackClickTelegramOrder,
  trackPurchase,
  trackViewItem,
  trackViewItemList,
} from '@/shared/analytics';

export function useViewItemList(
  listId: string,
  listName: string,
  products: ProductSummaryDto[] | undefined,
  enabled: boolean,
) {
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !products?.length) {
      return;
    }

    const key = `${listId}:${products.map((product) => product.id).join(',')}`;

    if (lastKeyRef.current === key) {
      return;
    }

    lastKeyRef.current = key;
    trackViewItemList(listId, listName, products);
  }, [enabled, listId, listName, products]);
}

export function useViewItem(product: ProductDetailDto | ProductSummaryDto | undefined, enabled: boolean) {
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !product) {
      return;
    }

    if (lastIdRef.current === product.id) {
      return;
    }

    lastIdRef.current = product.id;
    trackViewItem(product);
  }, [enabled, product]);
}

export function useBeginCheckout(items: CartLine[], enabled: boolean) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!enabled || items.length === 0 || trackedRef.current) {
      return;
    }

    trackedRef.current = true;
    trackBeginCheckout(items);
  }, [enabled, items]);
}

export function useAnalyticsActions() {
  return {
    trackPurchase,
    trackClickTelegramOrder,
  };
}

export type { PurchasePayload };
