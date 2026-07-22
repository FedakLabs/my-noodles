'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { Product } from '@my-noodles/api-clients/storefront';
import { useMutation } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { feedMutations } from '@/api/feed';

import { LiveProductPeek, SectionReveal, useLandingHeroProducts } from '../../_shared';

export function SurpriseMe() {
  const t = useTranslations('home.variants.b');
  const { products } = useLandingHeroProducts();
  const fallback = products?.items[0];
  const [product, setProduct] = useState<Product | null>(null);
  const [usedFallback, setUsedFallback] = useState(false);

  const { mutate, isPending } = useMutation({
    ...feedMutations.next(),
    onSuccess: (response) => {
      if (response.item) {
        setProduct(response.item);
        setUsedFallback(false);
        return;
      }

      if (fallback) {
        setProduct(fallback);
        setUsedFallback(true);
      }
    },
    onError: () => {
      if (fallback) {
        setProduct(fallback);
        setUsedFallback(true);
      }
    },
  });

  return (
    <SectionReveal sx={{ px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 }, bgcolor: 'primary.light' }}>
      <Stack spacing={3} sx={{ maxWidth: 720, mx: 'auto', alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h4" component="h2">
          {t('surpriseTitle')}
        </Typography>
        <Button
          variant="contained"
          size="large"
          disabled={isPending}
          onClick={() => mutate({})}
          startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {isPending ? t('surpriseLoading') : t('surpriseCta')}
        </Button>
        {usedFallback ? (
          <Typography variant="body2" color="text.secondary">
            {t('surpriseError')}
          </Typography>
        ) : null}
        {product ? (
          <Box sx={{ width: '100%' }}>
            <LiveProductPeek product={product} />
          </Box>
        ) : null}
      </Stack>
    </SectionReveal>
  );
}
