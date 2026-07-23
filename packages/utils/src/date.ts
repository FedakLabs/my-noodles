import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/** Inclusive UTC calendar-day start for a `YYYY-MM-DD` date. */
export function utcDayStart(isoDate: string): Date {
  return dayjs.utc(isoDate).startOf('day').toDate();
}

/** Inclusive UTC calendar-day end for a `YYYY-MM-DD` date. */
export function utcDayEnd(isoDate: string): Date {
  return dayjs.utc(isoDate).endOf('day').toDate();
}
