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

import { type OtelOptions } from '../otel';
import { type ConfigEnvironment, DEFAULT_NODE_ENV, NODE_ENVS, type NodeEnv } from './env';
import { parseBoolean } from './parse-boolean';

export type { ConfigEnvironment } from './env';
export { DEFAULT_NODE_ENV, NODE_ENVS, type NodeEnv } from './env';

export type LoadConfigOptions = {
  /** Absolute path to the service `src/` (or `dist/` when compiled) — root for entity/migration globs. */
  rootDirname: string;
};

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
  appName: string = 'my-noodles-api';

  @IsDefined()
  @IsString()
  @MinLength(1)
  appVersion: string = 'dev';

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

  /** Artificial latency for local UI testing. */
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60_000)
  responseDelayMs = 0;

  get otel(): OtelOptions {
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

function configFromEnvironment(source: ConfigEnvironment, options: LoadConfigOptions): Config {
  const payload: Record<string, unknown> = {
    rootDirname: options.rootDirname,
    appName: source.APP_NAME,
    appVersion: source.APP_VERSION,
    port: source.PORT,
    nodeEnv: source.NODE_ENV,
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
  };

  if (source.API_RESPONSE_DELAY_MS?.trim()) {
    payload.responseDelayMs = source.API_RESPONSE_DELAY_MS;
  }

  return plainToInstance(Config, payload, { enableImplicitConversion: true });
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

export function loadConfig(source: ConfigEnvironment, options: LoadConfigOptions): Config {
  return validateConfig(configFromEnvironment(source, options));
}
