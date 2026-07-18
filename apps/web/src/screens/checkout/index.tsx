'use client';

import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { useCheckout } from '@/api/checkouts';
import { CheckoutCancelledState } from '@/components/checkout/checkout-cancelled-state';
import { CheckoutForm } from '@/components/checkout/checkout-form';
import { PageContainer } from '@/components/layout/page-container';
import { useBeginCheckout } from '@/hooks/analytics';
import { useCheckoutSessionState } from '@/hooks/checkout';

type CheckoutScreenProps = {
  checkoutId: string;
};

export function CheckoutScreen({ checkoutId }: CheckoutScreenProps) {
  const t = useTranslations('checkout');
  const { checkout, checkoutIsInitialLoad, checkoutError } = useCheckout(checkoutId);
  const session = useCheckoutSessionState({ checkoutId, checkout });

  const checkoutLines =
    checkout?.order.items.map((item) => ({
      productId: item.productId,
      slug: item.productId,
      title: item.titleSnapshot,
      priceMinor: item.priceMinorSnapshot,
      currency: checkout.order.currency,
      qty: item.qty,
    })) ?? [];

  useBeginCheckout(checkoutLines, session.isInProgress && checkoutLines.length > 0);

  let content: ReactNode;

  if (checkoutIsInitialLoad) {
    content = (
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <CircularProgress size={20} aria-hidden />
        <Typography color="text.secondary">{t('loading')}</Typography>
      </Stack>
    );
  } else if (checkoutError) {
    content = <Typography color="error">{t('error')}</Typography>;
  } else if (!checkout) {
    content = <Typography color="text.secondary">{t('empty')}</Typography>;
  } else if (session.isInProgress) {
    content = (
      <CheckoutForm checkoutId={checkoutId} checkout={checkout} onHoldExpired={session.onHoldExpired} />
    );
  } else if (session.isExpired) {
    content = <CheckoutCancelledState title={t('inactive.title')} description={session.expiredDescription} />;
  } else {
    content = <CheckoutCancelledState title={t('inactive.title')} description={t('inactive.description')} />;
  }

  return (
    <PageContainer>
      <Stack spacing={3} sx={{ width: '100%', maxWidth: { mobile: 480, desktop: 'none' }, mx: 'auto' }}>
        <Typography variant="h4">{t('title')}</Typography>
        {content}
      </Stack>
    </PageContainer>
  );
}
