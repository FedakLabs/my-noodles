import type { NextRequest } from 'next/server';

import { env } from '@/shared/env';

import {
  isLandingVariant,
  LANDING_COOKIE,
  LANDING_QUERY_PARAM,
  type LandingVariant,
  type LandingVariantSource,
} from './config';

export type LandingAssignment = {
  variant: LandingVariant;
  source: LandingVariantSource;
};

function pickRandomVariant(): LandingVariant {
  const bytes = new Uint8Array(1);
  crypto.getRandomValues(bytes);
  const index = (bytes[0] ?? 0) % 3;
  return (['a', 'b', 'c'] as const)[index] ?? 'a';
}

/**
 * Precedence: `?lp=` → `LANDING_VARIANT` env → `lp` cookie → random.
 * Env beats cookie so a deliberate deploy / local force is not stuck on an old bucket.
 */
export function resolveAssignment(request: NextRequest): LandingAssignment {
  const queryValue = request.nextUrl.searchParams.get(LANDING_QUERY_PARAM);
  if (isLandingVariant(queryValue)) {
    return { variant: queryValue, source: 'query' };
  }

  if (env.LANDING_VARIANT) {
    return { variant: env.LANDING_VARIANT, source: 'env' };
  }

  const cookieValue = request.cookies.get(LANDING_COOKIE)?.value;
  if (isLandingVariant(cookieValue)) {
    return { variant: cookieValue, source: 'cookie' };
  }

  return { variant: pickRandomVariant(), source: 'assigned' };
}
