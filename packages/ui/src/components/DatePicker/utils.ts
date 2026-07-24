import dayjs from 'dayjs';
import type { DateRange as DayPickerDateRange, Matcher } from 'react-day-picker';

import type { DateRange, DateRangeValue } from './types';

const DATE_DISPLAY_FORMAT = 'DD.MM.YYYY';
export const DATE_INPUT_PLACEHOLDER = 'DD.MM.YYYY';

export function getInitialDisplayMonth(range: DateRangeValue | undefined): Date {
  if (range?.from) {
    return dayjs(range.from).startOf('month').toDate();
  }

  if (range?.to) {
    return dayjs(range.to).subtract(1, 'month').startOf('month').toDate();
  }

  return dayjs().startOf('month').toDate();
}

export function getCalendarDisabledDays(
  disabled?: boolean,
  minDate?: Date,
  maxDate?: Date,
): Matcher | Matcher[] | undefined {
  if (disabled) {
    return true;
  }

  const matchers: Matcher[] = [];

  if (minDate) {
    matchers.push({ before: dayjs(minDate).startOf('day').toDate() });
  }

  if (maxDate) {
    matchers.push({ after: dayjs(maxDate).startOf('day').toDate() });
  }

  return matchers.length > 0 ? matchers : undefined;
}

export function isOutsideBounds(date: Date, minDate?: Date, maxDate?: Date): boolean {
  if (minDate && dayjs(date).isBefore(minDate, 'day')) {
    return true;
  }

  if (maxDate && dayjs(date).isAfter(maxDate, 'day')) {
    return true;
  }

  return false;
}

export function formatInputValue(date?: Date): string {
  if (!date) {
    return '';
  }

  return dayjs(date).format(DATE_DISPLAY_FORMAT);
}

export function parseInputValue(value: string): Date | undefined {
  const trimmed = value.trim();

  if (!/^\d{2}\.\d{2}\.\d{4}$/.test(trimmed)) {
    return undefined;
  }

  const [dayString, monthString, yearString] = trimmed.split('.');
  const day = Number(dayString);
  const month = Number(monthString);
  const year = Number(yearString);

  const parsed = dayjs(new Date(year, month - 1, day));

  if (!parsed.isValid() || parsed.date() !== day || parsed.month() !== month - 1 || parsed.year() !== year) {
    return undefined;
  }

  return parsed.startOf('day').toDate();
}

export function toDayPickerRange(value: DateRangeValue | undefined): DayPickerDateRange | undefined {
  if (!value?.from && !value?.to) {
    return undefined;
  }

  return { from: value.from, to: value.to };
}

export function isSameDay(left?: Date, right?: Date): boolean {
  if (!left || !right) {
    return left === right;
  }

  return dayjs(left).isSame(right, 'day');
}

export function isSameRange(left: DateRangeValue | undefined, right: DateRangeValue | undefined): boolean {
  return isSameDay(left?.from, right?.from) && isSameDay(left?.to, right?.to);
}

export function isCompleteRange(range: DateRangeValue | undefined): range is DateRange {
  return Boolean(range?.from && range?.to);
}

export function rangesEqual(left: DateRange, right: DateRange): boolean {
  return isSameDay(left.from, right.from) && isSameDay(left.to, right.to);
}
