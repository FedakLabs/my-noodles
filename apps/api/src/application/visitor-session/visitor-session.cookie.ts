import type { CookieOptions, Request, Response } from 'express';

import { config } from '@/config';

import { VISITOR_COOKIE_MAX_AGE_MS, VISITOR_SESSION_COOKIE } from './visitor-session.config';

export function readVisitorSessionId(req: Request): string | undefined {
  const cookies = (req.cookies ?? {}) as Record<string, unknown>;
  const raw = cookies[VISITOR_SESSION_COOKIE];
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}

export function writeVisitorSessionCookie(res: Response, visitorId: string): void {
  const options: CookieOptions = {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv === 'prod',
    path: '/',
    maxAge: VISITOR_COOKIE_MAX_AGE_MS,
  };

  res.cookie(VISITOR_SESSION_COOKIE, visitorId, options);
}
