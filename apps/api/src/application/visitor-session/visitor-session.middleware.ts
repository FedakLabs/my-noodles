import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { CookieOptions, NextFunction, Request, Response } from 'express';

import { config } from '@/config';

import { VISITOR_COOKIE_MAX_AGE_MS, VISITOR_SESSION_COOKIE } from './visitor-session.config';
import { VisitorSessionService } from './visitor-session.service';

@Injectable()
export class VisitorSessionMiddleware implements NestMiddleware {
  constructor(private readonly visitorService: VisitorSessionService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const visitor = await this.visitorService.resolve(this.readVisitorSessionId(req));
    this.writeVisitorSessionCookie(res, visitor.id);
    req.visitorSession = visitor;
    next();
  }

  private readVisitorSessionId(req: Request): string | undefined {
    const cookies = (req.cookies ?? {}) as Record<string, unknown>;
    const raw = cookies[VISITOR_SESSION_COOKIE];
    return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
  }

  private writeVisitorSessionCookie(res: Response, visitorId: string): void {
    const options: CookieOptions = {
      httpOnly: true,
      sameSite: 'lax',
      secure: config.nodeEnv === 'prod',
      path: '/',
      maxAge: VISITOR_COOKIE_MAX_AGE_MS,
    };

    res.cookie(VISITOR_SESSION_COOKIE, visitorId, options);
  }
}
