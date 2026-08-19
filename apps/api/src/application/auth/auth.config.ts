import { Type } from 'class-transformer';
import { IsDefined, IsInt, IsString, Max, Min, MinLength } from 'class-validator';

import { config } from '@/config';

export class AuthConfig {
  @IsDefined()
  @IsString()
  @MinLength(16)
  jwtSecret = process.env.JWT_SECRET;

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
}

export const authConfig = config.validate(new AuthConfig(), 'Auth configuration');
