'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { CheckoutForm } from '@/components/checkout/checkout-form';
import { PageContainer } from '@/components/layout/page-container';
import { useBeginCheckout } from '@/hooks/analytics';
import { useCartItems } from '@/hooks/cart';

export function CheckoutScreen() {
  const t = useTranslations('checkout');
  const items = useCartItems();

  useBeginCheckout(items, items.length > 0);

  return (
    <PageContainer>
      <Stack spacing={3} sx={{ maxWidth: 480 }}>
        <Typography variant="h4">{t('title')}</Typography>
        <CheckoutForm />
      </Stack>
    </PageContainer>
  );
}
