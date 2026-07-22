'use client';

import Box from '@mui/material/Box';
import { useTranslations } from 'next-intl';

import { HomeCta, useLenis } from '../../_shared';
import { AroundTheWorld } from './around-the-world';
import { HeroCraving } from './hero-craving';
import { HumanTruth } from './human-truth';
import { ThreeDoors } from './three-doors';
import { TriedByUs } from './tried-by-us';

export function TastingTableLanding() {
  useLenis();
  const t = useTranslations('home.variants.a');

  return (
    <Box component="main">
      <HeroCraving />
      <HumanTruth />
      <ThreeDoors />
      <TriedByUs />
      <AroundTheWorld />
      <HomeCta headline={t('ctaHeadline')} body={t('ctaBody')} primaryHref="/catalog" secondaryHref="/feed" />
    </Box>
  );
}
