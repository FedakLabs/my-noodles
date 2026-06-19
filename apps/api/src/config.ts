import { resolve } from 'node:path';

import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDefined,
  IsIn,
  IsInt,
  IsString,
  IsUrl,
  Max,
  Min,
  MinLength,
  ValidateIf,
  validateSync,
} from 'class-validator';
import { config as loadDotenv } from 'dotenv';

function loadAppEnv(): void {
  const root = process.cwd();

  loadDotenv({ path: resolve(root, '.env') });
  loadDotenv({ path: resolve(root, '.env.local'), override: true });
}

loadAppEnv();

export class EnvironmentVariables {
  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;

  @IsIn(['local', 'dev', 'prod'])
  NODE_ENV: 'local' | 'dev' | 'prod' = 'local';

  @IsDefined()
  @IsString()
  @MinLength(1)
  POSTGRES_HOST!: string;

  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(65535)
  POSTGRES_PORT!: number;

  @IsDefined()
  @IsString()
  @MinLength(1)
  POSTGRES_USER!: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  POSTGRES_PASSWORD!: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  POSTGRES_DB!: string;

  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return false;
    }

    return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
  })
  @IsBoolean()
  OTEL_ENABLED = false;

  @ValidateIf((env: EnvironmentVariables) => env.OTEL_ENABLED)
  @IsDefined()
  @IsUrl({ require_tld: false })
  OTEL_EXPORTER_OTLP_ENDPOINT?: string;

  @ValidateIf((env: EnvironmentVariables) => env.OTEL_ENABLED)
  @IsDefined()
  @IsString()
  @MinLength(1)
  OTEL_SERVICE_NAME?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(120_000)
  SHUTDOWN_TIMEOUT_MS = 30_000;

  @IsString()
  @MinLength(1)
  APP_NAME = 'my-noodles-api';

  @IsString()
  @MinLength(1)
  APP_VERSION = 'dev';
}

export function validateEnvironment(source: Record<string, unknown> = process.env): EnvironmentVariables {
  const instance = plainToInstance(
    EnvironmentVariables,
    { ...new EnvironmentVariables(), ...source },
    { enableImplicitConversion: true },
  );

  const errors = validateSync(instance);
  if (errors.length > 0) {
    // Enhance the error message for readability and context
    const details = errors
      .map((error) => {
        const prop = error.property;
        const constraints = Object.values(error.constraints ?? {}).join(', ');
        return `  - ${prop}: ${constraints}`;
      })
      .join('\n');
    throw new Error(
      [
        '❌ Invalid environment configuration.\nThe following required environment variables are missing or invalid:',
        details,
        '\nPlease check your configuration (.env, .env.local) and try again.',
      ].join('\n'),
    );
  }

  return instance;
}

export type DatabaseConfig = Readonly<{
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}>;

export type OtelConfig =
  | Readonly<{ enabled: false }>
  | Readonly<{ enabled: true; endpoint: string; serviceName: string }>;

export type LoggingConfig = Readonly<{
  appName: string;
  appVersion: string;
}>;

export class Config {
  readonly port: number;
  readonly nodeEnv: EnvironmentVariables['NODE_ENV'];
  readonly database: DatabaseConfig;
  readonly otel: OtelConfig;
  readonly shutdownTimeoutMs: number;
  readonly logging: LoggingConfig;

  private constructor(params: {
    port: number;
    nodeEnv: EnvironmentVariables['NODE_ENV'];
    database: DatabaseConfig;
    otel: OtelConfig;
    shutdownTimeoutMs: number;
    logging: LoggingConfig;
  }) {
    this.port = params.port;
    this.nodeEnv = params.nodeEnv;
    this.database = Object.freeze({ ...params.database });
    this.otel = Object.freeze({ ...params.otel });
    this.shutdownTimeoutMs = params.shutdownTimeoutMs;
    this.logging = Object.freeze({ ...params.logging });
  }

  static fromEnvironment(env: EnvironmentVariables): Config {
    return new Config({
      port: env.PORT,
      nodeEnv: env.NODE_ENV,
      database: {
        host: env.POSTGRES_HOST,
        port: env.POSTGRES_PORT,
        username: env.POSTGRES_USER,
        password: env.POSTGRES_PASSWORD,
        database: env.POSTGRES_DB,
      },
      otel: env.OTEL_ENABLED
        ? {
            enabled: true,
            endpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT!,
            serviceName: env.OTEL_SERVICE_NAME!,
          }
        : { enabled: false },
      shutdownTimeoutMs: env.SHUTDOWN_TIMEOUT_MS,
      logging: {
        appName: env.APP_NAME,
        appVersion: env.APP_VERSION,
      },
    });
  }
}

export const config = Config.fromEnvironment(validateEnvironment());
