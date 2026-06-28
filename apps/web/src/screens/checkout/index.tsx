'use client';

import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

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
  const session = useCheckoutSessionState({ checkoutId, error: checkoutError ?? undefined });

  const checkoutLines =
    checkout?.items.map((item) => ({
      productId: item.productId,
      slug: item.productId,
      title: item.title,
      priceMinor: item.priceMinor,
      currency: checkout.currency,
      qty: item.qty,
    })) ?? [];

  useBeginCheckout(checkoutLines, checkoutLines.length > 0);

  const loadErrorView = session.isExpired ? (
    <CheckoutCancelledState title={t('inactive.title')} description={session.expiredDescription} />
  ) : session.isNotInProgress ? (
    <CheckoutCancelledState title={t('inactive.title')} description={t('inactive.description')} />
  ) : (
    <Typography color="error">{t('error')}</Typography>
  );

  return (
    <PageContainer>
      <Stack spacing={3} sx={{ width: '100%', maxWidth: { mobile: 480, desktop: 'none' }, mx: 'auto' }}>
        <Typography variant="h4">{t('title')}</Typography>

        {checkoutIsInitialLoad ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <CircularProgress size={20} aria-hidden />
            <Typography color="text.secondary">{t('loading')}</Typography>
          </Stack>
        ) : checkoutError || !checkout ? (
          loadErrorView
        ) : (
          <CheckoutForm checkoutId={checkoutId} checkout={checkout} onHoldExpired={session.onHoldExpired} />
        )}
      </Stack>
    </PageContainer>
  );
}
