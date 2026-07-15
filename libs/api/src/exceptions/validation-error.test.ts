import { IS_NOT_EMPTY, IS_STRING, MAX_LENGTH, MIN, MIN_LENGTH, type ValidationError } from 'class-validator';

import { flattenValidationErrors } from './validation-error';

function error(partial: Partial<ValidationError> & Pick<ValidationError, 'property'>): ValidationError {
  return {
    target: {},
    value: undefined,
    children: [],
    toString: () => '',
    ...partial,
  };
}

describe('flattenValidationErrors', () => {
  it('flattens a flat field with a single constraint', () => {
    const result = flattenValidationErrors([
      error({
        property: 'phone',
        constraints: { [IS_NOT_EMPTY]: 'phone should not be empty' },
      }),
    ]);

    expect(result).toEqual([{ path: 'phone', code: 'required', message: 'phone should not be empty' }]);
  });

  it('flattens nested children with dot paths', () => {
    const result = flattenValidationErrors([
      error({
        property: 'delivery',
        children: [
          error({
            property: 'city',
            constraints: { [IS_NOT_EMPTY]: 'city should not be empty' },
          }),
        ],
      }),
    ]);

    expect(result).toEqual([
      { path: 'delivery.city', code: 'required', message: 'city should not be empty' },
    ]);
  });

  it('flattens array indices into dot paths', () => {
    const result = flattenValidationErrors([
      error({
        property: 'items',
        children: [
          error({
            property: '0',
            children: [
              error({
                property: 'qty',
                constraints: { [MIN]: 'qty must not be less than 1' },
              }),
            ],
          }),
        ],
      }),
    ]);

    expect(result).toEqual([
      { path: 'items.0.qty', code: 'too_small', message: 'qty must not be less than 1' },
    ]);
  });

  it('emits one entry per failed constraint on the same field', () => {
    const result = flattenValidationErrors([
      error({
        property: 'name',
        constraints: {
          [IS_NOT_EMPTY]: 'name should not be empty',
          [MAX_LENGTH]: 'name must be shorter than or equal to 50 characters',
        },
      }),
    ]);

    expect(result).toEqual([
      { path: 'name', code: 'required', message: 'name should not be empty' },
      {
        path: 'name',
        code: 'too_long',
        message: 'name must be shorter than or equal to 50 characters',
      },
    ]);
  });

  it('maps stable codes from class-validator constraint keys', () => {
    const result = flattenValidationErrors([
      error({
        property: 'bio',
        constraints: {
          [MIN_LENGTH]: 'bio is too short',
          [MAX_LENGTH]: 'bio is too long',
          whitelistValidation: 'property bio should not exist',
        },
      }),
    ]);

    expect(result).toEqual([
      { path: 'bio', code: 'too_short', message: 'bio is too short' },
      { path: 'bio', code: 'too_long', message: 'bio is too long' },
      { path: 'bio', code: 'not_allowed', message: 'property bio should not exist' },
    ]);
  });

  it('falls back to invalid for unmapped constraint keys', () => {
    const result = flattenValidationErrors([
      error({
        property: 'email',
        constraints: { [IS_STRING]: 'email must be a string' },
      }),
    ]);

    expect(result).toEqual([{ path: 'email', code: 'invalid', message: 'email must be a string' }]);
  });

  it('returns a generic fallback when no errors are produced', () => {
    expect(flattenValidationErrors([])).toEqual([
      { path: '', code: 'invalid', message: 'Validation failed' },
    ]);
  });
});
