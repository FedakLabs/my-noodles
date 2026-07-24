'use client';

import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import { DEFAULT_LOCALE, type Locale } from '@my-noodles/locale';
import dayjs from 'dayjs';
import { useState } from 'react';
import { DayPicker, type DateRange as DayPickerDateRange } from 'react-day-picker';

import { CalendarNav } from './CalendarNav';
import { getDayPickerLocale } from './locale';
import { getDayPickerSx } from './styles';
import type { DatePreset, DateRange, DateRangeValue } from './types';
import {
  DATE_INPUT_PLACEHOLDER,
  formatInputValue,
  getCalendarDisabledDays,
  getInitialDisplayMonth,
  isCompleteRange,
  isOutsideBounds,
  isSameRange,
  parseInputValue,
  rangesEqual,
  toDayPickerRange,
} from './utils';

export type DateRangePickerProps = {
  value?: DateRangeValue;
  onApply: (range: DateRange) => void;
  applyLabel: string;
  fromLabel: string;
  toLabel: string;
  previousMonthLabel: string;
  nextMonthLabel: string;
  locale?: Locale;
  presets?: DatePreset[][];
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  showOutsideDays?: boolean;
  sx?: SxProps<Theme>;
};

export function DateRangePicker({
  value,
  onApply,
  applyLabel,
  fromLabel,
  toLabel,
  previousMonthLabel,
  nextMonthLabel,
  locale = DEFAULT_LOCALE,
  presets = [],
  minDate,
  maxDate,
  disabled = false,
  showOutsideDays = false,
  sx,
}: DateRangePickerProps) {
  const theme = useTheme();
  const [draft, setDraft] = useState<DateRangeValue | undefined>(value);
  const [prevValue, setPrevValue] = useState(value);
  const [displayMonth, setDisplayMonth] = useState(() => getInitialDisplayMonth(value));
  const [fromInputValue, setFromInputValue] = useState(() => formatInputValue(value?.from));
  const [toInputValue, setToInputValue] = useState(() => formatInputValue(value?.to));

  if (!isSameRange(value, prevValue)) {
    setPrevValue(value);
    setDraft(value);
    setFromInputValue(formatInputValue(value?.from));
    setToInputValue(formatInputValue(value?.to));
    setDisplayMonth(getInitialDisplayMonth(value));
  }

  const dayPickerLocale = getDayPickerLocale(locale);
  const calendarDisabledDays = getCalendarDisabledDays(disabled, minDate, maxDate);
  const showPresets = presets.length > 0;
  const canApply = isCompleteRange(draft) && !disabled;

  const syncInputs = (next: DateRangeValue | undefined) => {
    setFromInputValue(formatInputValue(next?.from));
    setToInputValue(formatInputValue(next?.to));
  };

  const setDraftRange = (next: DateRangeValue | undefined) => {
    setDraft(next);
    syncInputs(next);
  };

  const handleRangeSelect = (nextRange: DayPickerDateRange | undefined) => {
    setDraftRange(nextRange ? { from: nextRange.from, to: nextRange.to } : undefined);
  };

  const handleFromInputChange = (raw: string) => {
    setFromInputValue(raw);
    const parsed = parseInputValue(raw);

    if (!parsed || isOutsideBounds(parsed, minDate, maxDate)) {
      return;
    }

    const nextTo = draft?.to && dayjs(draft.to).isBefore(parsed, 'day') ? parsed : draft?.to;
    const next = { from: parsed, to: nextTo };

    setDraft(next);
    setToInputValue(formatInputValue(next.to));
    setDisplayMonth(dayjs(parsed).startOf('month').toDate());
  };

  const handleToInputChange = (raw: string) => {
    setToInputValue(raw);
    const parsed = parseInputValue(raw);

    if (!parsed || isOutsideBounds(parsed, minDate, maxDate)) {
      return;
    }

    const nextFrom = draft?.from && dayjs(draft.from).isAfter(parsed, 'day') ? parsed : draft?.from;
    const next = { from: nextFrom, to: parsed };

    setDraft(next);
    setFromInputValue(formatInputValue(next.from));
    setDisplayMonth(
      dayjs(parsed)
        .subtract(nextFrom ? 0 : 1, 'month')
        .startOf('month')
        .toDate(),
    );
  };

  const handlePresetClick = (preset: DatePreset) => {
    const next = preset.getValue();
    setDraftRange(next);
    setDisplayMonth(dayjs(next.from).startOf('month').toDate());
  };

  const handleApply = () => {
    if (!isCompleteRange(draft)) {
      return;
    }

    onApply({ from: draft.from, to: draft.to });
  };

  const selectedPresetId = (() => {
    if (!isCompleteRange(draft)) {
      return undefined;
    }

    for (const group of presets) {
      for (const preset of group) {
        if (rangesEqual(preset.getValue(), draft)) {
          return preset.id;
        }
      }
    }

    return undefined;
  })();

  return (
    <Stack direction="row" sx={sx}>
      {showPresets ? (
        <Stack
          sx={{
            borderRight: `1px solid ${theme.colors.border.subtle}`,
            py: theme.customSpacing.padding.sm,
            minWidth: 140,
          }}
        >
          {presets.map((group, groupIndex) => (
            <Stack key={`preset-group-${groupIndex}`}>
              {groupIndex > 0 ? <Divider sx={{ my: theme.customSpacing.gap.xs }} /> : null}
              {group.map((preset) => {
                const selected = selectedPresetId === preset.id;

                return (
                  <Button
                    key={preset.id}
                    color={selected ? 'primary' : 'inherit'}
                    variant={selected ? 'contained' : 'text'}
                    disabled={disabled}
                    aria-pressed={selected}
                    sx={{
                      justifyContent: 'flex-start',
                      px: theme.customSpacing.padding.md,
                      py: theme.customSpacing.padding.xs,
                      textTransform: 'none',
                      borderRadius: 0,
                    }}
                    onClick={() => handlePresetClick(preset)}
                  >
                    {preset.label}
                  </Button>
                );
              })}
            </Stack>
          ))}
        </Stack>
      ) : null}

      <Stack
        spacing={theme.customSpacing.gap.md}
        sx={{ p: theme.customSpacing.padding.lg, width: 'max-content' }}
      >
        <Stack direction="row" spacing={theme.customSpacing.gap.md}>
          <TextField
            size="small"
            label={fromLabel}
            value={fromInputValue}
            placeholder={DATE_INPUT_PLACEHOLDER}
            disabled={disabled}
            onChange={(event) => handleFromInputChange(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 148 }}
          />
          <TextField
            size="small"
            label={toLabel}
            value={toInputValue}
            placeholder={DATE_INPUT_PLACEHOLDER}
            disabled={disabled}
            onChange={(event) => handleToInputChange(event.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ width: 148 }}
          />
        </Stack>

        <Stack>
          <CalendarNav
            displayMonth={displayMonth}
            numberOfMonths={2}
            locale={locale}
            disabled={disabled}
            previousMonthLabel={previousMonthLabel}
            nextMonthLabel={nextMonthLabel}
            onPrevious={() =>
              setDisplayMonth(dayjs(displayMonth).subtract(1, 'month').startOf('month').toDate())
            }
            onNext={() => setDisplayMonth(dayjs(displayMonth).add(1, 'month').startOf('month').toDate())}
          />
          <Stack sx={getDayPickerSx(theme)}>
            <DayPicker
              mode="range"
              hideNavigation
              month={displayMonth}
              numberOfMonths={2}
              selected={toDayPickerRange(draft)}
              locale={dayPickerLocale}
              disabled={calendarDisabledDays}
              showOutsideDays={showOutsideDays}
              onMonthChange={setDisplayMonth}
              onSelect={handleRangeSelect}
            />
          </Stack>
        </Stack>

        <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained" disabled={!canApply} onClick={handleApply}>
            {applyLabel}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
