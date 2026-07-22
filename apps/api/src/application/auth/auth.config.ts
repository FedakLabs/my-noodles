import { Type } from 'class-transformer';
import { IsDefined, IsEmail, IsInt, IsString, Max, Min, MinLength } from 'class-validator';

import { config } from '@/config';

const LOCAL_JWT_SECRET = 'local-dev-jwt-secret-key';
const LOCAL_ADMIN_EMAIL = 'admin@my-noodles.local';
const LOCAL_ADMIN_PASSWORD = 'changeme123';

class AuthConfig {
  @IsDefined()
  @IsString()
  @MinLength(16)
  jwtSecret = process.env.JWT_SECRET ?? LOCAL_JWT_SECRET;

  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @Min(60)
  @Max(86_400)
  accessTtlSeconds = (process.env.JWT_ACCESS_TTL_SECONDS ?? '900') as unknown as number;

  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @Min(60)
  @Max(31_536_000)
  refreshTtlSeconds = (process.env.JWT_REFRESH_TTL_SECONDS ?? '2592000') as unknown as number;

  @IsDefined()
  @IsEmail()
  adminEmail = process.env.ADMIN_EMAIL ?? LOCAL_ADMIN_EMAIL;

  @IsDefined()
  @IsString()
  @MinLength(8)
  adminPassword = process.env.ADMIN_PASSWORD ?? LOCAL_ADMIN_PASSWORD;
}

export const authConfig = config.validate(new AuthConfig(), 'Auth configuration');
