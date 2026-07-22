import { JwtTokenService } from '@my-noodles/api-lib/auth';
import { AuthGuard, JWT_TOKEN_SERVICE } from '@my-noodles/api-lib/nest/auth';
import { Module } from '@nestjs/common';

import { UsersModule } from '@/application/users';

import { authConfig } from './auth.config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [UsersModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthGuard,
    {
      provide: JWT_TOKEN_SERVICE,
      useFactory: () =>
        new JwtTokenService({
          secret: authConfig.jwtSecret,
          accessTtlSeconds: authConfig.accessTtlSeconds,
          refreshTtlSeconds: authConfig.refreshTtlSeconds,
        }),
    },
  ],
  exports: [JWT_TOKEN_SERVICE, AuthGuard],
})
export class AuthModule {}
