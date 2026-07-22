'use client';

import Box from '@mui/material/Box';

import { CountryMarquee } from './country-marquee';
import { FeelItTeasers } from './feel-it-teasers';
import { PickYourDoorCta } from './pick-your-door-cta';
import { PortalPlayground } from './portal-playground';
import { SurpriseMe } from './surprise-me';
import { TrustRibbon } from './trust-ribbon';

export function ChooseYourDoorLanding() {
  return (
    <Box component="main">
      <PortalPlayground />
      <FeelItTeasers />
      <SurpriseMe />
      <TrustRibbon />
      <CountryMarquee />
      <PickYourDoorCta />
    </Box>
  );
}
