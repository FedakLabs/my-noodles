import createMiddleware from 'next-intl/middleware';
import type { NextRequest } from 'next/server';

import { routing } from './i18n/routing';
import { resolveAssignment } from './shared/experiment/assign';
import {
  LANDING_COOKIE,
  LANDING_COOKIE_OPTIONS,
  LANDING_SOURCE_COOKIE,
  LANDING_SOURCE_HEADER,
  type LandingVariantSource,
} from './shared/experiment/config';

const handleI18n = createMiddleware(routing);

function resolveEffectiveSource(
  request: NextRequest,
  assignmentSource: LandingVariantSource,
): LandingVariantSource {
  if (assignmentSource === 'query' || assignmentSource === 'env' || assignmentSource === 'assigned') {
    return assignmentSource;
  }

  // Preserve first-assign source across the bare `/` → `/uk` redirect hop only.
  if (request.cookies.get(LANDING_SOURCE_COOKIE)?.value === 'assigned') {
    return 'assigned';
  }

  return 'cookie';
}

export default function proxy(request: NextRequest) {
  const assignment = resolveAssignment(request);
  const { variant } = assignment;
  const source = resolveEffectiveSource(request, assignment.source);

  // Same-request RSC on /uk must see the bucket before next-intl runs.
  request.cookies.set(LANDING_COOKIE, variant);
  request.cookies.set(LANDING_SOURCE_COOKIE, source);
  request.headers.set(LANDING_SOURCE_HEADER, source);

  const response = handleI18n(request);

  response.cookies.set(LANDING_COOKIE, variant, LANDING_COOKIE_OPTIONS);
  response.headers.set(LANDING_SOURCE_HEADER, source);

  const isRedirect = response.status >= 300 && response.status < 400;
  // Document responses demote to cookie so a one-off ?lp= does not stick as "query".
  const persistedSource: LandingVariantSource = isRedirect ? source : 'cookie';
  response.cookies.set(LANDING_SOURCE_COOKIE, persistedSource, LANDING_COOKIE_OPTIONS);

  return response;
}

export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
