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
  ValidateNested,
  validateSync,
} from 'class-validator';

import { parseBoolean } from '@/utils/transformers';

import {
  type ConfigEnvironment,
  DEFAULT_NODE_ENV,
  loadAppEnv,
  NODE_ENVS,
  type NodeEnv,
  readConfigEnvironment,
} from './env';

export { DEFAULT_NODE_ENV, NODE_ENVS, type NodeEnv } from './env';

/** Absolute path to `src/` (or `dist/` when compiled) — root for entity/migration globs. */
const ROOT_DIRNAME = __dirname;

loadAppEnv();

export type OtelConfig =
  | Readonly<{ enabled: false }>
  | Readonly<{ enabled: true; endpoint: string; serviceName: string }>;

export class DatabaseConfig {
  @IsDefined()
  @IsString()
  @MinLength(1)
  host!: string;

  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(65535)
  port!: number;

  @IsDefined()
  @IsString()
  @MinLength(1)
  username!: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  password!: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  database!: string;

  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  logging = false;
}

export class Config {
  @IsDefined()
  @IsString()
  @MinLength(1)
  rootDirname!: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  appName!: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  appVersion!: string;

  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(65535)
  port!: number;

  @IsIn([...NODE_ENVS])
  nodeEnv: NodeEnv = DEFAULT_NODE_ENV;

  @ValidateNested()
  @Type(() => DatabaseConfig)
  database!: DatabaseConfig;

  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  otelEnabled = false;

  @ValidateIf((config: Config) => config.otelEnabled)
  @IsDefined()
  @IsUrl({ require_tld: false })
  otelEndpoint?: string;

  @ValidateIf((config: Config) => config.otelEnabled)
  @IsDefined()
  @IsString()
  @MinLength(1)
  otelServiceName?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(120_000)
  shutdownTimeoutMs = 30_000;

  get otel(): OtelConfig {
    if (this.otelEnabled) {
      return {
        enabled: true,
        endpoint: this.otelEndpoint!,
        serviceName: this.otelServiceName!,
      };
    }

    return { enabled: false };
  }
}

function configFromEnvironment(source: ConfigEnvironment): Config {
  return plainToInstance(
    Config,
    {
      rootDirname: ROOT_DIRNAME,
      appName: source.APP_NAME ?? 'my-noodles-api',
      appVersion: source.APP_VERSION ?? 'dev',
      port: source.PORT,
      nodeEnv: source.NODE_ENV ?? DEFAULT_NODE_ENV,
      database: {
        host: source.POSTGRES_HOST,
        port: source.POSTGRES_PORT,
        username: source.POSTGRES_USER,
        password: source.POSTGRES_PASSWORD,
        database: source.POSTGRES_DB,
        logging: source.DATABASE_LOGGING,
      },
      otelEnabled: source.OTEL_ENABLED,
      otelEndpoint: source.OTEL_EXPORTER_OTLP_ENDPOINT,
      otelServiceName: source.OTEL_SERVICE_NAME,
      shutdownTimeoutMs: source.SHUTDOWN_TIMEOUT_MS,
    },
    { enableImplicitConversion: true },
  );
}

function validateConfig(instance: Config): Config {
  const errors = validateSync(instance, { forbidUnknownValues: false });
  if (errors.length > 0) {
    const details = errors
      .map((error) => {
        const constraints = Object.values(error.constraints ?? {}).join(', ');
        return `  - ${error.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(
      [
        '❌ Invalid application configuration.',
        'The following config fields are missing or invalid:',
        details,
        '\nPlease check your environment (.env, .env.local) and try again.',
      ].join('\n'),
    );
  }

  return instance;
}

export function loadConfig(source: ConfigEnvironment = readConfigEnvironment(process.env)): Config {
  return validateConfig(configFromEnvironment(source));
}

export const config = loadConfig();
