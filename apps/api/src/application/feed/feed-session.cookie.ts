import type { CookieOptions, Request, Response } from 'express';

import { config } from '@/config';

/** Opaque session id stored in an HttpOnly cookie; identifies the anonymous feed session. */
export const FEED_SESSION_COOKIE = 'feed_sid';

/** Sliding idle window — refreshed on every `/feed/next` and like; lapsed sessions start fresh. */
export const FEED_SESSION_IDLE_MS = 2 * 60 * 60 * 1000;

export function readFeedSessionId(req: Request): string | undefined {
  const cookies = (req.cookies ?? {}) as Record<string, unknown>;
  const raw = cookies[FEED_SESSION_COOKIE];
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}

export function writeFeedSessionCookie(
  res: Response,
  sessionId: string,
  secure = config.nodeEnv === 'prod',
): void {
  const options: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure,
    path: '/',
    maxAge: FEED_SESSION_IDLE_MS,
  };

  res.cookie(FEED_SESSION_COOKIE, sessionId, options);
}
