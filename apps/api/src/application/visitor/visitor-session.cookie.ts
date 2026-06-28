import type { CookieOptions, Request, Response } from 'express';

import { config } from '@/config';

/** Opaque visitor id — device-bound identity shared by feed, cart, and orders. */
export const VISITOR_SESSION_COOKIE = 'vsid';

/** Persistent cookie lifetime — not tied to feed/cart feature TTLs. */
const VISITOR_COOKIE_MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000;

/** Feed views reset after this idle window (sliding on feed activity). */
export const FEED_IDLE_MS = 2 * 60 * 60 * 1000;

/** Cart items cleared after this idle window (sliding on cart activity). */
export const CART_IDLE_MS = 30 * 24 * 60 * 60 * 1000;

export function readVisitorSessionId(req: Request): string | undefined {
  const cookies = (req.cookies ?? {}) as Record<string, unknown>;
  const raw = cookies[VISITOR_SESSION_COOKIE];
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}

export function writeVisitorSessionCookie(
  res: Response,
  visitorId: string,
  secure = config.nodeEnv === 'prod',
): void {
  const options: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: VISITOR_COOKIE_MAX_AGE_MS,
  };

  res.cookie(VISITOR_SESSION_COOKIE, visitorId, options);
}
