'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BusyArea, iconStyle } from '@my-noodles/ui';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import { useTranslations } from 'next-intl';

import { useCartQuery } from '@/api/cart';
import { useActiveCheckouts, useStartCheckout } from '@/api/checkouts';
import { type CartLine, useCartActions, useCartItems, useCartTotalMinor } from '@/hooks/cart';
import { resolveCartErrorMessage } from '@/hooks/cart/cart-error-messages';
import { useCurrency } from '@/hooks/currency';
import { usePendingRouter } from '@/hooks/smooth';

import { CartCheckoutRow } from './cart-checkout-row';
import { CartEmptyState } from './cart-empty-state';

type CartPanelProps = {
  onClose: () => void;
};

export function CartPanel({ onClose }: CartPanelProps) {
  const t = useTranslations('cart');
  const tCommon = useTranslations('common');
  const { formatCurrency } = useCurrency();
  const items = useCartItems();
  const totalMinor = useCartTotalMinor();
  const { checkouts: activeCheckouts } = useActiveCheckouts();
  const { cart } = useCartQuery();
  const {
    setQuantity,
    removeItem,
    clearCart,
    clearCartIsPending,
    beginCheckout,
    isUpdatingProduct,
    isRemovingProduct,
  } = useCartActions();
  const {
    startCheckout,
    startCheckoutIsPending,
    startCheckoutIsError,
    startCheckoutError,
    startCheckoutReset,
  } = useStartCheckout();
  const router = usePendingRouter();

  const currency = cart?.currency;

  const checkoutErrorMessage = startCheckoutIsError
    ? resolveCartErrorMessage(t, startCheckoutError, 'checkoutError')
    : undefined;

  const panelBusy = clearCartIsPending || startCheckoutIsPending;

  const handleStartCheckout = () => {
    startCheckoutReset();
    startCheckout(undefined, {
      onSuccess: (checkout) => {
        beginCheckout();
        router.push(`/checkout/${checkout.id}`);
      },
    });
  };

  return (
    <BusyArea
      busy={panelBusy}
      label={tCommon('loading')}
      timingOptions={{ minVisibleMs: 0, showDelayMs: 0 }}
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <Typography variant="h6">{t('title')}</Typography>
          <IconButton onClick={onClose} aria-label={t('close')}>
            <CloseIcon aria-hidden style={iconStyle({ size: 24, color: 'inherit' })} />
          </IconButton>
        </Stack>

        {startCheckoutIsError ? (
          <Alert severity="error" sx={{ mx: 2, mt: 1.5, flexShrink: 0 }}>
            {checkoutErrorMessage}
          </Alert>
        ) : null}

        <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2, display: 'flex', flexDirection: 'column' }}>
          {activeCheckouts.length > 0 ? (
            <Stack spacing={0}>
              {activeCheckouts.map((checkout) => (
                <CartCheckoutRow key={checkout.id} checkout={checkout} onClose={onClose} />
              ))}
            </Stack>
          ) : null}

          {items.length === 0 ? (
            <CartEmptyState onClose={onClose} />
          ) : (
            <Stack spacing={1.5}>
              {items.map((item) => (
                <CartLineRow
                  key={item.productId}
                  item={item}
                  isUpdating={isUpdatingProduct(item.productId)}
                  isRemoving={isRemovingProduct(item.productId)}
                  onDecrease={() => setQuantity(item.productId, item.qty - 1, item)}
                  onIncrease={() => setQuantity(item.productId, item.qty + 1, item)}
                  onRemove={() => removeItem(item.productId, item)}
                  formatCurrency={formatCurrency}
                  t={t}
                />
              ))}
            </Stack>
          )}
        </Box>

        {items.length > 0 ? (
          <Stack
            spacing={1.5}
            sx={{
              flexShrink: 0,
              p: 2,
              borderTop: 1,
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Typography variant="subtitle1">
              {t('total')}: {formatCurrency(totalMinor, currency)}
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" fullWidth onClick={onClose}>
                {t('continueBrowsing')}
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                disabled={clearCartIsPending}
                aria-busy={clearCartIsPending}
                startIcon={
                  clearCartIsPending ? <CircularProgress size={20} color="inherit" aria-hidden /> : undefined
                }
                onClick={() => clearCart()}
              >
                {t('clearCart')}
              </Button>
            </Stack>
            <Button
              variant="contained"
              size="large"
              fullWidth
              disabled={startCheckoutIsPending}
              aria-busy={startCheckoutIsPending}
              startIcon={
                startCheckoutIsPending ? (
                  <CircularProgress size={22} color="inherit" aria-hidden />
                ) : undefined
              }
              onClick={handleStartCheckout}
            >
              {activeCheckouts.length > 0 ? t('active.addToCheckout') : t('checkout')}
            </Button>
          </Stack>
        ) : null}
      </Stack>
    </BusyArea>
  );
}

type CartLineRowProps = {
  item: CartLine;
  isUpdating: boolean;
  isRemoving: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
  onRemove: () => void;
  formatCurrency: (amount: number, currency: string) => string;
  t: ReturnType<typeof useTranslations<'cart'>>;
};

function CartLineRow({
  item,
  isUpdating,
  isRemoving,
  onDecrease,
  onIncrease,
  onRemove,
  formatCurrency,
  t,
}: CartLineRowProps) {
  const lineBusy = isUpdating || isRemoving;

  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{
        alignItems: 'center',
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
      }}
    >
      {item.imageUrl ? (
        <Box
          component="img"
          src={item.imageUrl}
          alt={item.title}
          sx={{ width: 72, height: 72, objectFit: 'cover', borderRadius: 1, flexShrink: 0 }}
        />
      ) : null}
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {item.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatCurrency(item.priceMinor, item.currency)}
        </Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton
            size="small"
            aria-label={t('decrease')}
            aria-busy={isUpdating}
            disabled={lineBusy}
            onClick={onDecrease}
            sx={{ width: 28, height: 28 }}
          >
            {isUpdating ? <CircularProgress size={16} color="inherit" aria-hidden /> : '−'}
          </IconButton>
          <Typography variant="body2" sx={{ minWidth: 16, textAlign: 'center' }}>
            {item.qty}
          </Typography>
          <IconButton
            size="small"
            aria-label={t('increase')}
            aria-busy={isUpdating}
            disabled={lineBusy}
            onClick={onIncrease}
            sx={{ width: 28, height: 28 }}
          >
            {isUpdating ? <CircularProgress size={16} color="inherit" aria-hidden /> : '+'}
          </IconButton>
        </Stack>
      </Stack>
      <Button
        size="small"
        disabled={lineBusy}
        aria-busy={isRemoving}
        startIcon={isRemoving ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
        onClick={onRemove}
      >
        {t('remove')}
      </Button>
    </Stack>
  );
}
