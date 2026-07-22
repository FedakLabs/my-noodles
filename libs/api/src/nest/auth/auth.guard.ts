import { type CanActivate, type ExecutionContext, Inject, Injectable, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { type AccessTokenPayload, JwtTokenService, UnauthorizedAccessException } from '../../auth';

export const AUTH_USER_REQUEST_KEY = 'authUser';
export const IS_PUBLIC_AUTH_KEY = 'isPublicAuth';

/** Mark a handler or controller as skipping Bearer auth when AuthGuard is applied. */
export const PublicAuth = () => SetMetadata(IS_PUBLIC_AUTH_KEY, true);

export const JWT_TOKEN_SERVICE = Symbol('JWT_TOKEN_SERVICE');

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly reflector = new Reflector();

  constructor(@Inject(JWT_TOKEN_SERVICE) private readonly jwtTokenService: JwtTokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedAccessException('Missing bearer token');
    }

    const token = header.slice('Bearer '.length).trim();
    if (!token) {
      throw new UnauthorizedAccessException('Missing bearer token');
    }

    const payload = await this.jwtTokenService.verifyAccessToken(token);
    (request as Request & { [AUTH_USER_REQUEST_KEY]?: AccessTokenPayload })[AUTH_USER_REQUEST_KEY] = payload;

    return true;
  }
}
