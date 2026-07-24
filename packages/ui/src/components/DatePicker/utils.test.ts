import { describe, expect, it } from 'vitest';

import { formatInputValue, isCompleteRange, isOutsideBounds, parseInputValue } from './utils';

describe('DatePicker utils', () => {
  it('formats dates as DD.MM.YYYY', () => {
    expect(formatInputValue(new Date(2026, 6, 24))).toBe('24.07.2026');
    expect(formatInputValue(undefined)).toBe('');
  });

  it('parses valid calendar dates and rejects invalid ones', () => {
    expect(parseInputValue('24.07.2026')).toEqual(new Date(2026, 6, 24));
    expect(parseInputValue('31.02.2026')).toBeUndefined();
    expect(parseInputValue('24.7.2026')).toBeUndefined();
    expect(parseInputValue('incomplete')).toBeUndefined();
  });

  it('detects dates outside min/max bounds', () => {
    const date = new Date(2026, 6, 24);
    expect(isOutsideBounds(date, new Date(2026, 6, 25))).toBe(true);
    expect(isOutsideBounds(date, undefined, new Date(2026, 6, 23))).toBe(true);
    expect(isOutsideBounds(date, new Date(2026, 6, 1), new Date(2026, 6, 31))).toBe(false);
  });

  it('requires both ends for a complete range', () => {
    expect(isCompleteRange({ from: new Date(2026, 6, 1), to: new Date(2026, 6, 24) })).toBe(true);
    expect(isCompleteRange({ from: new Date(2026, 6, 1) })).toBe(false);
    expect(isCompleteRange(undefined)).toBe(false);
  });
});
