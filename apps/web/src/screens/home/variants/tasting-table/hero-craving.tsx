'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';

import { useLandingHeroProducts } from '../../_shared';
import { AmbientCardDrift } from './ambient-card-drift';

export function HeroCraving() {
  const t = useTranslations('home.variants.a');
  const { products } = useLandingHeroProducts();

  return (
    <Box
      component="section"
      sx={{
        minHeight: { xs: '85dvh', md: '78dvh' },
        display: 'flex',
        alignItems: 'center',
        px: { xs: 2, md: 4 },
        py: { xs: 6, md: 8 },
        background: (theme) =>
          `linear-gradient(165deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.light} 55%, ${theme.palette.background.default} 100%)`,
      }}
    >
      <Stack spacing={2} sx={{ width: '100%', maxWidth: 720, mx: 'auto', textAlign: 'center' }}>
        <Typography variant="h3" component="h1">
          {t('heroHeadline')}
        </Typography>
        <Box>
          <Button component={Link} href="/catalog" variant="contained" size="large">
            {t('heroCta')}
          </Button>
        </Box>
        <AmbientCardDrift products={products?.items ?? []} />
      </Stack>
    </Box>
  );
}
