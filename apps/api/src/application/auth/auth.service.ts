import {
  InvalidCredentialsException,
  JwtTokenService,
  PasswordHasher,
  type TokenPair,
} from '@my-noodles/api-lib/auth';
import { JWT_TOKEN_SERVICE } from '@my-noodles/api-lib/nest/auth';
import { Inject, Injectable } from '@nestjs/common';

import { UsersService } from '@/application/users';

@Injectable()
export class AuthService {
  private readonly passwordHasher = new PasswordHasher();

  constructor(
    @Inject(UsersService) private readonly usersService: UsersService,
    @Inject(JWT_TOKEN_SERVICE) private readonly jwtTokenService: JwtTokenService,
  ) {}

  async login(email: string, password: string): Promise<TokenPair> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const valid = await this.passwordHasher.verify(user.passwordHash, password);
    if (!valid) {
      throw new InvalidCredentialsException();
    }

    return await this.jwtTokenService.issueTokenPair({
      sub: user.id,
      email: user.email,
    });
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = await this.jwtTokenService.verifyRefreshToken(refreshToken);
    await this.usersService.get({ id: payload.sub });
    return await this.jwtTokenService.issueTokenPair({
      sub: payload.sub,
      email: payload.email,
    });
  }

  async me(userId: string): Promise<{ id: string; email: string }> {
    const user = await this.usersService.get({ id: userId });
    return { id: user.id, email: user.email };
  }
}
