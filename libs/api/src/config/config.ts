import { resolve } from 'node:path';

import { type ClassConstructor, instanceToPlain, plainToInstance, Type } from 'class-transformer';
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
import { type SentryOptions } from '../sentry';
import { TransformToBoolean } from '../transformers';
import { loadAppEnv, NODE_ENVS, type NodeEnv } from './env';

export const DATABASE_DRIVERS = ['postgres'] as const;
export type DatabaseDriver = (typeof DATABASE_DRIVERS)[number];

type BooleanConfigValue = boolean | string | undefined;
type NumberConfigValue = number | string | undefined;

export type DatabaseConfigOptions = Readonly<{
  driver: string | undefined;
  url: string | undefined;
  host: string | undefined;
  port: NumberConfigValue;
  username: string | undefined;
  password: string | undefined;
  name: string | undefined;
  ssl: BooleanConfigValue;
  logging: BooleanConfigValue;
}>;

export type ConfigOptions = Readonly<{
  appName: string | undefined;
  appVersion: string | undefined;
  port: NumberConfigValue;
  nodeEnv: string | undefined;
  database: DatabaseConfigOptions;
  otelEnabled: BooleanConfigValue;
  otelEndpoint: string | undefined;
  otelServiceName: string | undefined;
  sentryEnabled: BooleanConfigValue;
  sentryDsn: string | undefined;
  shutdownTimeoutMs: NumberConfigValue;
  responseDelayMs: NumberConfigValue;
}>;

export type ConfigFactory = (env: NodeJS.ProcessEnv) => ConfigOptions;

type ValidateConfigOptions = {
  label: string;
};

export class DatabaseConfig {
  @IsIn([...DATABASE_DRIVERS])
  driver!: DatabaseDriver;

  /**
   * Managed database URL. When set, discrete DATABASE_* connection fields are unused.
   * Prod runtime: pooled URL. Migrations: direct (non-pooled) URL.
   */
  @ValidateIf((config: DatabaseConfig) => Boolean(config.url))
  @IsString()
  @MinLength(1)
  url?: string;

  @ValidateIf((config: DatabaseConfig) => !config.url)
  @IsDefined()
  @IsString()
  @MinLength(1)
  host!: string;

  @ValidateIf((config: DatabaseConfig) => !config.url)
  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(65535)
  port!: number;

  @ValidateIf((config: DatabaseConfig) => !config.url)
  @IsDefined()
  @IsString()
  @MinLength(1)
  username!: string;

  @ValidateIf((config: DatabaseConfig) => !config.url)
  @IsDefined()
  @IsString()
  @MinLength(1)
  password!: string;

  @ValidateIf((config: DatabaseConfig) => !config.url)
  @IsDefined()
  @IsString()
  @MinLength(1)
  name!: string;

  @TransformToBoolean()
  @IsDefined()
  @IsBoolean()
  ssl!: boolean;

  @TransformToBoolean()
  @IsDefined()
  @IsBoolean()
  logging!: boolean;

  constructor(options?: DatabaseConfigOptions) {
    if (options) {
      Object.assign(this, options);
    }
  }
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
  nodeEnv!: NodeEnv;

  @ValidateNested()
  @Type(() => DatabaseConfig)
  database!: DatabaseConfig;

  @TransformToBoolean()
  @IsDefined()
  @IsBoolean()
  otelEnabled!: boolean;

  @ValidateIf((config: Config) => config.otelEnabled)
  @IsDefined()
  @IsUrl({ require_tld: false })
  otelEndpoint?: string;

  @ValidateIf((config: Config) => config.otelEnabled)
  @IsDefined()
  @IsString()
  @MinLength(1)
  otelServiceName?: string;

  @TransformToBoolean()
  @IsDefined()
  @IsBoolean()
  sentryEnabled!: boolean;

  @ValidateIf((config: Config) => config.sentryEnabled)
  @IsDefined()
  @IsString()
  @MinLength(1)
  sentryDsn?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(120_000)
  shutdownTimeoutMs!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60_000)
  responseDelayMs!: number;

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

  get sentry(): SentryOptions {
    if (this.sentryEnabled) {
      return {
        enabled: true,
        dsn: this.sentryDsn!,
        environment: this.nodeEnv,
        release: this.appVersion,
      };
    }

    return { enabled: false };
  }

  constructor();
  constructor(rootDirname: string, configFactory: ConfigFactory);
  constructor(rootDirname?: string, configFactory?: ConfigFactory) {
    if (rootDirname === undefined || configFactory === undefined) {
      return;
    }

    loadAppEnv(resolve(rootDirname, '..'));

    const options = configFactory(process.env);
    Object.assign(this, options, {
      rootDirname,
      database: new DatabaseConfig(options.database),
    });

    return this.validate(this, 'Application configuration');
  }

  /** Apply class-transformer decorators and class-validator rules to a populated config instance. */
  validate<T extends object>(instance: T, label: string): T {
    const ConfigClass = instance.constructor as ClassConstructor<T>;
    const plain = instanceToPlain(instance);
    const validated = plainToInstance(ConfigClass, plain);
    const errors = validateSync(validated, { forbidUnknownValues: false });

    if (errors.length > 0) {
      this.formatValidationError(validated, { label });
    }

    return validated;
  }

  private formatValidationError(instance: object, options: ValidateConfigOptions): never {
    const errors = validateSync(instance, { forbidUnknownValues: false });
    const details = errors
      .map((error) => {
        const constraints = Object.values(error.constraints ?? {}).join(', ');
        return `  - ${error.property}: ${constraints}`;
      })
      .join('\n');

    throw new Error(
      [`❌ Invalid ${options.label}.`, 'The following config fields are missing or invalid:', details].join(
        '\n',
      ),
    );
  }
}
