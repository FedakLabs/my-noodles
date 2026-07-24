'use client';

import Stack from '@mui/material/Stack';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import { DEFAULT_LOCALE, type Locale } from '@my-noodles/locale';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DayPicker } from 'react-day-picker';

import { CalendarNav } from './CalendarNav';
import { getDayPickerLocale } from './locale';
import { getDayPickerSx } from './styles';
import { getCalendarDisabledDays, isSameDay } from './utils';

export type DateSinglePickerProps = {
  value?: Date;
  onChange: (value: Date | undefined) => void;
  previousMonthLabel: string;
  nextMonthLabel: string;
  locale?: Locale;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  showOutsideDays?: boolean;
  sx?: SxProps<Theme>;
};

export function DateSinglePicker({
  value,
  onChange,
  previousMonthLabel,
  nextMonthLabel,
  locale = DEFAULT_LOCALE,
  minDate,
  maxDate,
  disabled = false,
  showOutsideDays = false,
  sx,
}: DateSinglePickerProps) {
  const theme = useTheme();
  const [displayMonth, setDisplayMonth] = useState(() =>
    dayjs(value ?? new Date())
      .startOf('month')
      .toDate(),
  );
  const [prevValue, setPrevValue] = useState(value);

  if (!isSameDay(value, prevValue)) {
    setPrevValue(value);
    if (value) {
      setDisplayMonth(dayjs(value).startOf('month').toDate());
    }
  }

  const dayPickerLocale = getDayPickerLocale(locale);
  const calendarDisabledDays = getCalendarDisabledDays(disabled, minDate, maxDate);

  const rootSx: SxProps<Theme> = {
    p: theme.customSpacing.padding.lg,
    width: 'max-content',
  };

  return (
    <Stack sx={sx ? ([rootSx, sx] as SxProps<Theme>) : rootSx}>
      <CalendarNav
        displayMonth={displayMonth}
        numberOfMonths={1}
        locale={locale}
        disabled={disabled}
        previousMonthLabel={previousMonthLabel}
        nextMonthLabel={nextMonthLabel}
        onPrevious={() => setDisplayMonth(dayjs(displayMonth).subtract(1, 'month').startOf('month').toDate())}
        onNext={() => setDisplayMonth(dayjs(displayMonth).add(1, 'month').startOf('month').toDate())}
      />
      <Stack sx={getDayPickerSx(theme)}>
        <DayPicker
          mode="single"
          hideNavigation
          month={displayMonth}
          numberOfMonths={1}
          selected={value}
          locale={dayPickerLocale}
          disabled={calendarDisabledDays}
          showOutsideDays={showOutsideDays}
          onMonthChange={setDisplayMonth}
          onSelect={onChange}
        />
      </Stack>
    </Stack>
  );
}
