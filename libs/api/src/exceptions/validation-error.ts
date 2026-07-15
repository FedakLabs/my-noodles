import {
  ARRAY_MAX_SIZE,
  ARRAY_MIN_SIZE,
  ARRAY_NOT_EMPTY,
  IS_DEFINED,
  IS_NOT_EMPTY,
  MAX,
  MAX_LENGTH,
  MIN,
  MIN_LENGTH,
  type ValidationError,
} from 'class-validator';

export type ValidationCode =
  | 'required'
  | 'invalid'
  | 'too_short'
  | 'too_long'
  | 'too_small'
  | 'too_big'
  | 'not_allowed';

export type FieldValidationError = {
  path: string;
  code: ValidationCode;
  message: string;
};

const CONSTRAINT_CODE: Record<string, ValidationCode> = {
  [IS_NOT_EMPTY]: 'required',
  [IS_DEFINED]: 'required',
  [ARRAY_NOT_EMPTY]: 'required',
  [MIN_LENGTH]: 'too_short',
  [MAX_LENGTH]: 'too_long',
  [ARRAY_MIN_SIZE]: 'too_short',
  [ARRAY_MAX_SIZE]: 'too_long',
  [MIN]: 'too_small',
  [MAX]: 'too_big',
  // Internal ValidationExecutor key for forbidNonWhitelisted — not exported by class-validator.
  whitelistValidation: 'not_allowed',
};

const toValidationCode = (key: string): ValidationCode => CONSTRAINT_CODE[key] ?? 'invalid';

/** Flattens class-validator errors (incl. nested children / array indices) into a transport-neutral list. */
export function flattenValidationErrors(errors: ValidationError[]): FieldValidationError[] {
  const out: FieldValidationError[] = [];

  const walk = (nodes: ValidationError[], prefix: string) => {
    for (const node of nodes) {
      const path = prefix ? `${prefix}.${node.property}` : node.property;

      if (node.constraints) {
        for (const [key, message] of Object.entries(node.constraints)) {
          out.push({ path, code: toValidationCode(key), message });
        }
      }

      if (node.children?.length) {
        walk(node.children, path);
      }
    }
  };

  walk(errors, '');

  return out.length > 0 ? out : [{ path: '', code: 'invalid', message: 'Validation failed' }];
}
