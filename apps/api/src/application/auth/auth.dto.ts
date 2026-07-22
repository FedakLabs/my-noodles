import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

export class RefreshTokenDto {
  @IsString()
  @MinLength(1)
  refreshToken!: string;
}

export class AuthTokenResponseDto {
  accessToken!: string;
  refreshToken!: string;
  expiresAt!: Date;
}

export class AuthMeResponseDto {
  id!: string;
  email!: string;
}
