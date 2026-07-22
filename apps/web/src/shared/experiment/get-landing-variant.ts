import 'server-only';
import { cookies, headers } from 'next/headers';

import {
  LANDING_COOKIE,
  LANDING_SOURCE_COOKIE,
  LANDING_SOURCE_HEADER,
  parseLandingVariant,
  parseLandingVariantSource,
  type LandingVariant,
  type LandingVariantSource,
} from './config';

export type LandingVariantState = {
  variant: LandingVariant;
  source: LandingVariantSource;
};

/** Fallback when proxy has not yet stamped a cookie (should be rare). */
const DEFAULT_VARIANT: LandingVariant = 'a';

export async function getLandingVariant(): Promise<LandingVariantState> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const variant = parseLandingVariant(cookieStore.get(LANDING_COOKIE)?.value) ?? DEFAULT_VARIANT;
  const source = parseLandingVariantSource(
    headerStore.get(LANDING_SOURCE_HEADER) ?? cookieStore.get(LANDING_SOURCE_COOKIE)?.value,
  );

  return { variant, source };
}
