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
import { TransformToBoolean } from '../utils/transformers/boolean';
import { DEFAULT_NODE_ENV, loadAppEnv, NODE_ENVS, type NodeEnv } from './env';

export type ConfigOptions = {
  /** Absolute path to the service `src/` (or `dist/` when compiled) — root for entity/migration globs. */
  rootDirname: string;
};

type ValidateConfigOptions = {
  label: string;
};

export class DatabaseConfig {
  @IsDefined()
  @IsString()
  @MinLength(1)
  host = process.env.POSTGRES_HOST!;

  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(65535)
  port = process.env.POSTGRES_PORT as unknown as number;

  @IsDefined()
  @IsString()
  @MinLength(1)
  username = process.env.POSTGRES_USER!;

  @IsDefined()
  @IsString()
  @MinLength(1)
  password = process.env.POSTGRES_PASSWORD!;

  @IsDefined()
  @IsString()
  @MinLength(1)
  database = process.env.POSTGRES_DB!;

  @TransformToBoolean()
  @IsBoolean()
  logging = process.env.DATABASE_LOGGING as unknown as boolean;
}

export class Config {
  @IsDefined()
  @IsString()
  @MinLength(1)
  rootDirname!: string;

  @IsDefined()
  @IsString()
  @MinLength(1)
  appName = process.env.APP_NAME ?? 'my-noodles-api';

  @IsDefined()
  @IsString()
  @MinLength(1)
  appVersion = process.env.APP_VERSION ?? 'dev';

  @Type(() => Number)
  @IsDefined()
  @IsInt()
  @Min(1)
  @Max(65535)
  port = process.env.PORT as unknown as number;

  @IsIn([...NODE_ENVS])
  nodeEnv = (process.env.NODE_ENV ?? DEFAULT_NODE_ENV) as NodeEnv;

  @ValidateNested()
  @Type(() => DatabaseConfig)
  database = new DatabaseConfig();

  @TransformToBoolean()
  @IsBoolean()
  otelEnabled = process.env.OTEL_ENABLED as unknown as boolean;

  @ValidateIf((config: Config) => config.otelEnabled)
  @IsDefined()
  @IsUrl({ require_tld: false })
  otelEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  @ValidateIf((config: Config) => config.otelEnabled)
  @IsDefined()
  @IsString()
  @MinLength(1)
  otelServiceName = process.env.OTEL_SERVICE_NAME;

  @Type(() => Number)
  @IsInt()
  @Min(1000)
  @Max(120_000)
  shutdownTimeoutMs = (process.env.SHUTDOWN_TIMEOUT_MS ?? '30000') as unknown as number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60_000)
  responseDelayMs = (process.env.API_RESPONSE_DELAY_MS ?? '0') as unknown as number;

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

    const instance = new Config();
    instance.rootDirname = options.rootDirname;

    return instance.validate(instance, 'Application configuration');
  }

  /** Apply class-transformer decorators and class-validator rules to a populated config instance. */
  validate<T extends object>(instance: T, label: string): T {
    const ConfigClass = instance.constructor as ClassConstructor<T>;
    const plain = instanceToPlain(instance);
    const validated = plainToInstance(ConfigClass, plain, { enableImplicitConversion: true });
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
