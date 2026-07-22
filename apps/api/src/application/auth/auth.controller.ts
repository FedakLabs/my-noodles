import {
  InvalidCredentialsException,
  InvalidRefreshTokenException,
  UnauthorizedAccessException,
  type AccessTokenPayload,
} from '@my-noodles/api-lib/auth';
import { ApiException } from '@my-noodles/api-lib/nest';
import { AuthGuard, CurrentUser, PublicAuth } from '@my-noodles/api-lib/nest/auth';
import { Body, Controller, Get, Inject, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';

import { UserNotFoundException } from '@/application/users';

import { AuthMeResponseDto, AuthTokenResponseDto, LoginDto, RefreshTokenDto } from './auth.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @PublicAuth()
  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiException(InvalidCredentialsException)
  async login(@Body() dto: LoginDto): Promise<AuthTokenResponseDto> {
    return await this.authService.login(dto.email, dto.password);
  }

  @PublicAuth()
  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @ApiException(InvalidRefreshTokenException, UserNotFoundException)
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokenResponseDto> {
    return await this.authService.refresh(dto.refreshToken);
  }

  @Get('me')
  @ApiException(UnauthorizedAccessException, UserNotFoundException)
  async me(@CurrentUser() user: AccessTokenPayload): Promise<AuthMeResponseDto> {
    return await this.authService.me(user.sub);
  }
}
