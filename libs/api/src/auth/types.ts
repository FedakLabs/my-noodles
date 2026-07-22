export type AuthCredentials = {
  email: string;
  password: string;
};

export type AccessTokenPayload = {
  sub: string;
  email: string;
};

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
};

export type JwtTokenKind = 'access' | 'refresh';

export type JwtTokenServiceOptions = {
  secret: string;
  accessTtlSeconds: number;
  refreshTtlSeconds: number;
};
