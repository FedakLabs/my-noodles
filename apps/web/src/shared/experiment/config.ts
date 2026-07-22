export const LANDING_COOKIE = 'lp';

export const LANDING_SOURCE_COOKIE = 'lp_src';

export const LANDING_SOURCE_HEADER = 'x-lp-source';

export const LANDING_VARIANTS = ['a', 'b', 'c'] as const;

export type LandingVariant = (typeof LANDING_VARIANTS)[number];

export type LandingVariantSource = 'query' | 'env' | 'cookie' | 'assigned';

export const LANDING_QUERY_PARAM = 'lp';

export const LANDING_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365;

export const LANDING_COOKIE_OPTIONS = {
  path: '/',
  maxAge: LANDING_COOKIE_MAX_AGE_SECONDS,
  sameSite: 'lax' as const,
  httpOnly: false,
};

export function isLandingVariant(value: string | undefined | null): value is LandingVariant {
  return value != null && (LANDING_VARIANTS as readonly string[]).includes(value);
}

export function parseLandingVariant(value: string | undefined | null): LandingVariant | null {
  return isLandingVariant(value) ? value : null;
}

export function isLandingVariantSource(value: string | undefined | null): value is LandingVariantSource {
  return value === 'query' || value === 'env' || value === 'cookie' || value === 'assigned';
}

export function parseLandingVariantSource(value: string | undefined | null): LandingVariantSource {
  return isLandingVariantSource(value) ? value : 'cookie';
}
