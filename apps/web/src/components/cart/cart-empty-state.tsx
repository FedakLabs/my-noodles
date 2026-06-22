'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { useCartPanelOpenNonce } from '@/hooks/cart';
import { Link } from '@/i18n/navigation';
import { pickRandom } from '@/utils/pick-random';

const EMPTY_MESSAGE_KEYS = ['spicy', 'quiet', 'curious', 'room', 'next', 'wink'] as const;

type CartEmptyStateProps = {
  onClose: () => void;
};

export function CartEmptyState({ onClose }: CartEmptyStateProps) {
  const t = useTranslations('cart');
  const panelOpenNonce = useCartPanelOpenNonce();
  const messageKeys = useMemo(() => [...EMPTY_MESSAGE_KEYS], []);
  const messageKey = useMemo(() => {
    void panelOpenNonce;
    return pickRandom(messageKeys);
  }, [messageKeys, panelOpenNonce]);

  return (
    <Stack
      spacing={3}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: { xs: 280, md: '100%' },
        px: 1,
        py: 4,
      }}
    >
      <Typography
        variant="subtitle1"
        color="text.primary"
        sx={{
          maxWidth: 300,
          lineHeight: 1.5,
          fontWeight: 500,
        }}
      >
        {t(`emptyMessages.${messageKey}`)}
      </Typography>

      <Button component={Link} href="/catalog" variant="contained" onClick={onClose}>
        {t('browse')}
      </Button>
    </Stack>
  );
}
