'use client';

import dynamic from 'next/dynamic';

import type { LandingVariant, LandingVariantSource } from '@/shared/experiment';

import { LandingExperimentTracker } from './landing-experiment-tracker';

const TastingTableLanding = dynamic(() =>
  import('./variants/tasting-table').then((mod) => mod.TastingTableLanding),
);

const ChooseYourDoorLanding = dynamic(() =>
  import('./variants/choose-your-door').then((mod) => mod.ChooseYourDoorLanding),
);

const LivingReelLanding = dynamic(() =>
  import('./variants/living-reel').then((mod) => mod.LivingReelLanding),
);

export type HomeScreenProps = {
  variant: LandingVariant;
  source: LandingVariantSource;
};

export function HomeScreen({ variant, source }: HomeScreenProps) {
  return (
    <>
      <LandingExperimentTracker variant={variant} source={source} />
      {variant === 'a' ? <TastingTableLanding /> : null}
      {variant === 'b' ? <ChooseYourDoorLanding /> : null}
      {variant === 'c' ? <LivingReelLanding /> : null}
    </>
  );
}
