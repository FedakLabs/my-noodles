import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import type { VisitorSession } from './visitor-session.entity';
import { VisitorSessionNotResolvedException } from './visitor-session.exceptions';

export const CurrentVisitorSession = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): VisitorSession => {
    const visitor = ctx.switchToHttp().getRequest<Request>().visitorSession;

    if (!visitor) {
      throw new VisitorSessionNotResolvedException();
    }

    return visitor;
  },
);
