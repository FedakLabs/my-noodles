'use client';

import type { Product } from '@my-noodles/api-clients/storefront';
import { useEffect, useRef } from 'react';

import type { CartLine } from '@/hooks/cart';
import type { CatalogBrowseMode, PurchasePayload } from '@/shared/analytics';
import {
  trackBeginCheckout,
  trackClickTelegramOrder,
  trackPurchase,
  trackViewItem,
  trackViewItemList,
} from '@/shared/analytics';

import { useAnalyticsConsentGranted } from './use-analytics-consent-granted';

export function useViewItemList(
  listId: string,
  listName: string,
  products: Product[] | undefined,
  enabled: boolean,
  catalogBrowseMode?: CatalogBrowseMode,
) {
  const consentGranted = useAnalyticsConsentGranted();
  const lastKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !consentGranted || !products?.length) {
      return;
    }

    const key = `${listId}:${catalogBrowseMode ?? ''}:${products.map((product) => product.id).join(',')}`;

    if (lastKeyRef.current === key) {
      return;
    }

    lastKeyRef.current = key;
    trackViewItemList(listId, listName, products, { catalogBrowseMode });
  }, [catalogBrowseMode, consentGranted, enabled, listId, listName, products]);
}

export function useViewItem(product: Product | undefined, enabled: boolean) {
  const consentGranted = useAnalyticsConsentGranted();
  const lastIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !consentGranted || !product) {
      return;
    }

    if (lastIdRef.current === product.id) {
      return;
    }

    lastIdRef.current = product.id;
    trackViewItem(product);
  }, [consentGranted, enabled, product]);
}

export function useBeginCheckout(items: CartLine[], enabled: boolean) {
  const consentGranted = useAnalyticsConsentGranted();
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!enabled || !consentGranted || items.length === 0 || trackedRef.current) {
      return;
    }

    trackedRef.current = true;
    trackBeginCheckout(items);
  }, [consentGranted, enabled, items]);
}

export function useAnalyticsActions() {
  return {
    trackPurchase,
    trackClickTelegramOrder,
  };
}

export type { PurchasePayload };
