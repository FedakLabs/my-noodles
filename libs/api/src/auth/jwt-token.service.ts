import { SignJWT, jwtVerify } from 'jose';

import { InvalidRefreshTokenException, UnauthorizedAccessException } from './auth.exceptions';
import type { AccessTokenPayload, JwtTokenKind, JwtTokenServiceOptions, TokenPair } from './types';

type VerifiedToken = AccessTokenPayload & {
  kind: JwtTokenKind;
};

/**
 * Issues and verifies access + refresh JWTs (HS256).
 */
export class JwtTokenService {
  private readonly secret: Uint8Array;
  private readonly accessTtlSeconds: number;
  private readonly refreshTtlSeconds: number;

  constructor(options: JwtTokenServiceOptions) {
    this.secret = new TextEncoder().encode(options.secret);
    this.accessTtlSeconds = options.accessTtlSeconds;
    this.refreshTtlSeconds = options.refreshTtlSeconds;
  }

  async issueTokenPair(payload: AccessTokenPayload): Promise<TokenPair> {
    const expiresAt = new Date(Date.now() + this.accessTtlSeconds * 1000);
    const [accessToken, refreshToken] = await Promise.all([
      this.sign(payload, 'access', this.accessTtlSeconds),
      this.sign(payload, 'refresh', this.refreshTtlSeconds),
    ]);

    return { accessToken, refreshToken, expiresAt };
  }

  async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
    const verified = await this.verify(token, 'access');
    return { sub: verified.sub, email: verified.email };
  }

  async verifyRefreshToken(token: string): Promise<AccessTokenPayload> {
    const verified = await this.verify(token, 'refresh');
    return { sub: verified.sub, email: verified.email };
  }

  private async sign(payload: AccessTokenPayload, kind: JwtTokenKind, ttlSeconds: number): Promise<string> {
    return await new SignJWT({ email: payload.email, kind })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject(payload.sub)
      .setIssuedAt()
      .setExpirationTime(`${ttlSeconds}s`)
      .sign(this.secret);
  }

  private async verify(token: string, expectedKind: JwtTokenKind): Promise<VerifiedToken> {
    try {
      const { payload } = await jwtVerify(token, this.secret);
      const kind = payload.kind;
      const email = payload.email;
      const sub = payload.sub;

      if (
        (kind !== 'access' && kind !== 'refresh') ||
        kind !== expectedKind ||
        typeof email !== 'string' ||
        typeof sub !== 'string'
      ) {
        throw expectedKind === 'refresh'
          ? new InvalidRefreshTokenException()
          : new UnauthorizedAccessException();
      }

      return { sub, email, kind };
    } catch (error) {
      if (error instanceof UnauthorizedAccessException || error instanceof InvalidRefreshTokenException) {
        throw error;
      }

      throw expectedKind === 'refresh'
        ? new InvalidRefreshTokenException()
        : new UnauthorizedAccessException();
    }
  }
}
