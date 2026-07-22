import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

import { type AccessTokenPayload, UnauthorizedAccessException } from '../../auth';
import { AUTH_USER_REQUEST_KEY } from './auth.guard';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AccessTokenPayload => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const user = (request as Request & { [AUTH_USER_REQUEST_KEY]?: AccessTokenPayload })[
      AUTH_USER_REQUEST_KEY
    ];

    if (!user) {
      throw new UnauthorizedAccessException();
    }

    return user;
  },
);
