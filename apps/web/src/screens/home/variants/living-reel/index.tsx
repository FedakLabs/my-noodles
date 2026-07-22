'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';

import { SectionReveal, useLenis } from '../../_shared';
import { CountryMoodStrip } from './country-mood-strip';
import { HonestyTried } from './honesty-tried';
import { ScrollDock } from './scroll-dock';
import { StartReelCta } from './start-reel-cta';
import { ThreeMoods } from './three-moods';

export function LivingReelLanding() {
  useLenis();
  const t = useTranslations('home.variants.c');

  return (
    <Box component="main">
      <ScrollDock>
        <SectionReveal sx={{ px: { xs: 2, md: 4 }, py: { xs: 4, md: 5 }, textAlign: 'center' }}>
          <Stack spacing={1} sx={{ maxWidth: 640, mx: 'auto' }}>
            <Typography variant="h4" component="h2">
              {t('dockTitle')}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {t('dockBody')}
            </Typography>
          </Stack>
        </SectionReveal>
        <ThreeMoods />
        <HonestyTried />
        <CountryMoodStrip />
        <StartReelCta />
      </ScrollDock>
    </Box>
  );
}
