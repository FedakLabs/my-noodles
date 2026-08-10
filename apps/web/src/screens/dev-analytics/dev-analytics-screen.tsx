'use client';

import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Product } from '@my-noodles/api-clients/storefront';
import { DEFAULT_CURRENCY } from '@my-noodles/utils';
import { useState } from 'react';

import { PageContainer } from '@/components/layout/page-container';
import { useConsent } from '@/hooks/analytics';
import {
  trackAddToCart,
  trackBeginCheckout,
  trackCatalogBrowseMode,
  trackClickTelegramOrder,
  trackPurchase,
  trackRemoveFromCart,
  trackViewItem,
  trackViewItemList,
} from '@/shared/analytics';
import { ANALYTICS_ENABLED, env } from '@/shared/env';

const SAMPLE_PRODUCT = {
  id: '00000000-0000-4000-8000-000000000001',
  slug: 'dev-test-noodles',
  name: 'Dev Test Noodles',
  priceMinor: 9900,
  currency: DEFAULT_CURRENCY,
  brand: { slug: 'dev-brand', name: 'Dev Brand' },
  category: { slug: 'dev-category', name: 'Dev Category' },
} as Product;

const SAMPLE_LINE = {
  productId: SAMPLE_PRODUCT.id,
  slug: SAMPLE_PRODUCT.slug,
  title: SAMPLE_PRODUCT.name,
  priceMinor: SAMPLE_PRODUCT.priceMinor,
  currency: SAMPLE_PRODUCT.currency,
  qty: 1,
};

function readDataLayerTail(limit = 8): string {
  if (typeof window === 'undefined') {
    return '[]';
  }

  const layer = window.dataLayer ?? [];
  return JSON.stringify(layer.slice(-limit), null, 2);
}

export function DevAnalyticsScreen() {
  const { choice, showBanner, accept } = useConsent();
  const [dataLayerPreview, setDataLayerPreview] = useState(() => readDataLayerTail());

  const refreshPreview = () => {
    setDataLayerPreview(readDataLayerTail());
  };

  const run = (action: () => void) => {
    action();
    refreshPreview();
  };

  return (
    <PageContainer>
      <Stack spacing={2.5} sx={{ py: 2, alignItems: 'stretch', maxWidth: 720 }}>
        <Typography variant="h4">Analytics test (dev)</Typography>
        <Typography color="text.secondary">
          Accept consent, then fire sample events. Verify in GTM Preview, GA4 DebugView, or the dataLayer
          preview below.
        </Typography>

        <Alert severity={ANALYTICS_ENABLED ? 'success' : 'warning'}>
          GTM: {ANALYTICS_ENABLED ? env.NEXT_PUBLIC_GTM_ID : 'off (set NEXT_PUBLIC_GTM_ID + restart)'}
          {' · '}
          Consent: {choice}
          {showBanner ? ' (banner visible)' : ''}
        </Alert>

        {choice !== 'granted' ? (
          <Button variant="contained" onClick={accept} disabled={!ANALYTICS_ENABLED}>
            Accept analytics consent
          </Button>
        ) : null}

        <Stack direction="row" useFlexGap sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            disabled={choice !== 'granted'}
            onClick={() => run(() => trackViewItem(SAMPLE_PRODUCT))}
          >
            view_item
          </Button>
          <Button
            variant="outlined"
            disabled={choice !== 'granted'}
            onClick={() =>
              run(() =>
                trackViewItemList('dev-list', 'Dev list', [SAMPLE_PRODUCT], {
                  catalogBrowseMode: 'infinite',
                }),
              )
            }
          >
            view_item_list
          </Button>
          <Button
            variant="outlined"
            disabled={choice !== 'granted'}
            onClick={() => run(() => trackAddToCart(SAMPLE_LINE, 1))}
          >
            add_to_cart
          </Button>
          <Button
            variant="outlined"
            disabled={choice !== 'granted'}
            onClick={() => run(() => trackRemoveFromCart(SAMPLE_LINE))}
          >
            remove_from_cart
          </Button>
          <Button
            variant="outlined"
            disabled={choice !== 'granted'}
            onClick={() => run(() => trackBeginCheckout([SAMPLE_LINE]))}
          >
            begin_checkout
          </Button>
          <Button
            variant="outlined"
            disabled={choice !== 'granted'}
            onClick={() =>
              run(() =>
                trackPurchase({
                  transactionId: `dev-${Date.now()}`,
                  valueMinor: SAMPLE_LINE.priceMinor,
                  currency: SAMPLE_LINE.currency,
                  items: [
                    {
                      item_id: SAMPLE_LINE.slug,
                      item_name: SAMPLE_LINE.title,
                      price: SAMPLE_LINE.priceMinor / 100,
                      quantity: 1,
                    },
                  ],
                }),
              )
            }
          >
            purchase
          </Button>
          <Button
            variant="outlined"
            disabled={choice !== 'granted'}
            onClick={() => run(() => trackClickTelegramOrder())}
          >
            click_telegram_order
          </Button>
          <Button
            variant="outlined"
            disabled={choice !== 'granted'}
            onClick={() => run(() => trackCatalogBrowseMode('pagination', 'menu'))}
          >
            catalog_browse_mode
          </Button>
          <Button variant="text" onClick={refreshPreview}>
            Refresh dataLayer
          </Button>
        </Stack>

        <Typography variant="subtitle2">window.dataLayer (last entries)</Typography>
        <Typography
          component="pre"
          variant="body2"
          sx={{
            p: 1.5,
            borderRadius: 1,
            bgcolor: 'action.hover',
            overflow: 'auto',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {dataLayerPreview}
        </Typography>
      </Stack>
    </PageContainer>
  );
}
