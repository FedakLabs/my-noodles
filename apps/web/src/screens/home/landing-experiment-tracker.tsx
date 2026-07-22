'use client';

import { useEffect, useRef } from 'react';

import { useConsent } from '@/hooks/analytics/use-consent';
import { trackLandingVariant } from '@/shared/analytics';
import type { LandingVariant, LandingVariantSource } from '@/shared/experiment';

type LandingExperimentTrackerProps = {
  variant: LandingVariant;
  source: LandingVariantSource;
};

export function LandingExperimentTracker({ variant, source }: LandingExperimentTrackerProps) {
  const { choice } = useConsent();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current || choice !== 'granted') {
      return;
    }

    firedRef.current = true;
    trackLandingVariant(variant, source);
  }, [choice, source, variant]);

  return null;
}
