import { resolve } from 'node:path';

import { type ClassConstructor, Transform, Type } from 'class-transformer';
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
} from 'class-validator';

import { type OtelOptions } from '../otel';
import { parseBoolean } from '../utils/transformers/boolean';
import { DEFAULT_NODE_ENV, loadAppEnv, NODE_ENVS, type NodeEnv } from './env';
import { loadValidatedConfig } from './utils';

export type ConfigOptions = {
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

  constructor(options?: ConfigOptions) {
    if (!options) {
      return;
    }

    loadAppEnv(resolve(options.rootDirname, '..'));

    const { env } = process;

    return loadValidatedConfig(
      Config,
      {
        rootDirname: options.rootDirname,
        appName: env.APP_NAME,
        appVersion: env.APP_VERSION,
        port: env.PORT,
        nodeEnv: env.NODE_ENV,
        database: {
          host: env.POSTGRES_HOST,
          port: env.POSTGRES_PORT,
          username: env.POSTGRES_USER,
          password: env.POSTGRES_PASSWORD,
          database: env.POSTGRES_DB,
          logging: env.DATABASE_LOGGING,
        },
        otelEnabled: env.OTEL_ENABLED,
        otelEndpoint: env.OTEL_EXPORTER_OTLP_ENDPOINT,
        otelServiceName: env.OTEL_SERVICE_NAME,
        shutdownTimeoutMs: env.SHUTDOWN_TIMEOUT_MS,
        responseDelayMs: env.API_RESPONSE_DELAY_MS?.trim() ?? 0,
      },
      { label: 'application configuration' },
    );
  }

  /** Validate an app-local feature config after env has been loaded via the main `Config` constructor. */
  validate<T extends object>(
    ConfigClass: ClassConstructor<T>,
    payload: Record<string, unknown>,
    label?: string,
  ): T {
    return loadValidatedConfig(ConfigClass, payload, { label });
  }
}
