import { Injectable, type NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';

import { readVisitorSessionId, writeVisitorSessionCookie } from './visitor-session.cookie';
import { VisitorSessionService } from './visitor-session.service';

@Injectable()
export class VisitorSessionMiddleware implements NestMiddleware {
  constructor(private readonly visitorService: VisitorSessionService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const visitor = await this.visitorService.resolve(readVisitorSessionId(req));
    writeVisitorSessionCookie(res, visitor.id);
    req.visitorSession = visitor;
    next();
  }
}

@Injectable()
export class RequireVisitorSessionMiddleware implements NestMiddleware {
  constructor(private readonly visitorService: VisitorSessionService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const visitor = await this.visitorService.require(readVisitorSessionId(req));
    writeVisitorSessionCookie(res, visitor.id);
    req.visitorSession = visitor;
    next();
  }
}
