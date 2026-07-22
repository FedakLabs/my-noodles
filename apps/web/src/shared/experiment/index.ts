export { resolveAssignment, type LandingAssignment } from './assign';
export {
  isLandingVariant,
  isLandingVariantSource,
  LANDING_COOKIE,
  LANDING_COOKIE_OPTIONS,
  LANDING_QUERY_PARAM,
  LANDING_SOURCE_COOKIE,
  LANDING_SOURCE_HEADER,
  LANDING_VARIANTS,
  parseLandingVariant,
  parseLandingVariantSource,
  type LandingVariant,
  type LandingVariantSource,
} from './config';

// Intentionally not re-exporting get-landing-variant — it is server-only and must not
// enter the Edge proxy bundle via this barrel.
