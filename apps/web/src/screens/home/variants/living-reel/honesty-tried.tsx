'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { LiveProductPeek, SectionReveal, useLandingHeroProducts } from '../../_shared';

export function HonestyTried() {
  const t = useTranslations('home.variants.c');
  const { products } = useLandingHeroProducts();
  const product = products?.items.find((item) => item.isTriedByUs) ?? products?.items[0];

  return (
    <SectionReveal sx={{ px: { xs: 2, md: 4 }, py: { xs: 5, md: 7 }, bgcolor: 'primary.light' }}>
      <Stack spacing={3} sx={{ maxWidth: 720, mx: 'auto', alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h4" component="h2">
          {t('honestyTitle')}
        </Typography>
        {product ? <LiveProductPeek product={product} /> : null}
      </Stack>
    </SectionReveal>
  );
}
