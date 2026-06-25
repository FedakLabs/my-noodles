'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { iconStyle } from '@my-noodles/ui';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import { useTranslations } from 'next-intl';

import { useCartActions, useCartItems, useCartTotalMinor } from '@/hooks/cart';
import { useCurrency } from '@/hooks/currency';
import { Link } from '@/i18n/navigation';

import { CartEmptyState } from './cart-empty-state';

type CartPanelProps = {
  onClose: () => void;
};

export function CartPanel({ onClose }: CartPanelProps) {
  const t = useTranslations('cart');
  const { formatCurrency } = useCurrency();
  const items = useCartItems();
  const totalMinor = useCartTotalMinor();
  const { setQuantity, removeItem, beginCheckout } = useCartActions();

  return (
    <Stack sx={{ height: '100%', minHeight: 0 }}>
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

      <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 2, display: 'flex', flexDirection: 'column' }}>
        {items.length === 0 ? (
          <CartEmptyState onClose={onClose} />
        ) : (
          <Stack spacing={1.5}>
            {items.map((item) => (
              <Stack
                key={item.productId}
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
                      onClick={() => setQuantity(item.productId, item.qty - 1)}
                    >
                      −
                    </IconButton>
                    <Typography variant="body2">{item.qty}</Typography>
                    <IconButton
                      size="small"
                      aria-label={t('increase')}
                      onClick={() => setQuantity(item.productId, item.qty + 1)}
                    >
                      +
                    </IconButton>
                  </Stack>
                </Stack>
                <Button size="small" onClick={() => removeItem(item.productId)}>
                  {t('remove')}
                </Button>
              </Stack>
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
            {t('total')}: {formatCurrency(totalMinor, items[0]?.currency)}
          </Typography>
          <Button
            component={Link}
            href={'/checkout'}
            variant="contained"
            size="large"
            fullWidth
            onClick={() => beginCheckout()}
          >
            {t('checkout')}
          </Button>
          <Button variant="outlined" fullWidth onClick={onClose}>
            {t('continueBrowsing')}
          </Button>
        </Stack>
      ) : null}
    </Stack>
  );
}
