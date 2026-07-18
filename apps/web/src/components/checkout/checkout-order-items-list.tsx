'use client';

import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { Checkout } from '@/api/checkouts';
import { useCurrency } from '@/hooks/currency';

type CheckoutLineItem = Checkout['order']['items'][number];

type CheckoutOrderItemsListProps = {
  checkout: Checkout;
};

function CheckoutOrderLine({
  item,
  currency,
}: {
  item: CheckoutLineItem;
  currency: Checkout['order']['currency'];
}) {
  const t = useTranslations('checkout.items');
  const { formatCurrency } = useCurrency();

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <Stack spacing={0.25} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2">{item.titleSnapshot}</Typography>
        <Typography variant="caption" color="text.secondary">
          {t('lineQty', { qty: item.qty })} · {formatCurrency(item.priceMinorSnapshot, currency)}
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ flexShrink: 0 }}>
        {formatCurrency(item.priceMinorSnapshot * item.qty, currency)}
      </Typography>
    </Stack>
  );
}

export function CheckoutOrderItemsList({ checkout }: CheckoutOrderItemsListProps) {
  const t = useTranslations('checkout.items');
  const { formatCurrency } = useCurrency();
  const [expanded, setExpanded] = useState(false);

  const [firstItem, ...restItems] = checkout.order.items;
  const hasMoreItems = restItems.length > 0;

  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1">{t('title')}</Typography>

      {firstItem ? (
        <Stack spacing={1}>
          <CheckoutOrderLine item={firstItem} currency={checkout.order.currency} />

          {hasMoreItems ? (
            <Collapse in={expanded} timeout="auto" sx={{ width: '100%' }}>
              <Stack
                component="div"
                spacing={1}
                divider={restItems.length > 1 ? <Divider flexItem /> : undefined}
                sx={{
                  width: '100%',
                  pt: 1,
                  borderTop: 1,
                  borderColor: 'divider',
                }}
              >
                {restItems.map((item) => (
                  <CheckoutOrderLine key={item.productId} item={item} currency={checkout.order.currency} />
                ))}
              </Stack>
            </Collapse>
          ) : null}

          {hasMoreItems ? (
            <Button
              size="small"
              variant="text"
              onClick={() => setExpanded((value) => !value)}
              sx={{ alignSelf: 'flex-start', px: 0, minWidth: 0 }}
            >
              {expanded ? t('collapseList') : t('expandList', { count: restItems.length })}
            </Button>
          ) : null}
        </Stack>
      ) : null}

      <Stack direction="row" sx={{ justifyContent: 'space-between', pt: 0.5 }}>
        <Typography variant="subtitle2">{t('total')}</Typography>
        <Typography variant="subtitle2">
          {formatCurrency(checkout.order.totalMinor, checkout.order.currency)}
        </Typography>
      </Stack>
    </Stack>
  );
}
