import { UnauthorizedException } from '../exceptions';

export class InvalidCredentialsException extends UnauthorizedException {
  static readonly sample = new InvalidCredentialsException();

  constructor() {
    super({
      code: 'invalid_credentials',
      message: 'Invalid email or password',
    });
  }
}

export class UnauthorizedAccessException extends UnauthorizedException {
  static readonly sample = new UnauthorizedAccessException();

  constructor(message = 'Unauthorized') {
    super({
      code: 'unauthorized',
      message,
    });
  }
}

export class InvalidRefreshTokenException extends UnauthorizedException {
  static readonly sample = new InvalidRefreshTokenException();

  constructor() {
    super({
      code: 'invalid_refresh_token',
      message: 'Refresh token is invalid or expired',
    });
  }
}
