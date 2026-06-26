import { type ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export type LoadValidatedConfigOptions = {
  /** Shown in the validation error heading, e.g. `application configuration`. */
  label?: string;
};

function formatValidationError(instance: object, options: LoadValidatedConfigOptions): never {
  const errors = validateSync(instance, { forbidUnknownValues: false });
  const label = options.label ?? 'configuration';
  const details = errors
    .map((error) => {
      const constraints = Object.values(error.constraints ?? {}).join(', ');
      return `  - ${error.property}: ${constraints}`;
    })
    .join('\n');

  throw new Error(
    [`❌ Invalid ${label}.`, 'The following config fields are missing or invalid:', details].join('\n'),
  );
}

/** Map a plain payload to a class-validator DTO and throw a formatted error when invalid. */
export function loadValidatedConfig<T extends object>(
  ConfigClass: ClassConstructor<T>,
  payload: Record<string, unknown>,
  options: LoadValidatedConfigOptions = {},
): T {
  const instance = plainToInstance(ConfigClass, payload, { enableImplicitConversion: true });
  const errors = validateSync(instance, { forbidUnknownValues: false });

  if (errors.length > 0) {
    formatValidationError(instance, options);
  }

  return instance;
}
