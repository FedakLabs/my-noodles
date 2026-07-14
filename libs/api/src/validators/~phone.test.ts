import { describe, expect, it } from '@jest/globals';

import { isValidPhone, toE164 } from './phone';

describe('phone validators', () => {
  it('accepts valid E.164 numbers', () => {
    expect(isValidPhone('+380501112233')).toBe(true);
    expect(toE164('+380501112233')).toBe('+380501112233');
  });

  it('rejects invalid numbers', () => {
    expect(isValidPhone('123')).toBe(false);
    expect(isValidPhone('')).toBe(false);
    expect(toE164('123')).toBeNull();
  });
});
