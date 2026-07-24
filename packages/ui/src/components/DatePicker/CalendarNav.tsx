'use client';

import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { DEFAULT_LOCALE, type Locale } from '@my-noodles/locale';
import dayjs from 'dayjs';

import ChevronLeftIcon from '../../icons/chevron-left.svg';
import ChevronRightIcon from '../../icons/chevron-right.svg';
import { formatMonthCaption } from './locale';

export type CalendarNavProps = {
  displayMonth: Date;
  numberOfMonths?: 1 | 2;
  onPrevious: () => void;
  onNext: () => void;
  previousMonthLabel: string;
  nextMonthLabel: string;
  locale?: Locale;
  disabled?: boolean;
};

export function CalendarNav({
  displayMonth,
  numberOfMonths = 1,
  onPrevious,
  onNext,
  previousMonthLabel,
  nextMonthLabel,
  locale = DEFAULT_LOCALE,
  disabled = false,
}: CalendarNavProps) {
  const theme = useTheme();
  const secondMonth = dayjs(displayMonth).add(1, 'month').toDate();

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.customSpacing.gap.sm,
        mb: theme.customSpacing.gap.sm,
      }}
    >
      <IconButton size="small" disabled={disabled} aria-label={previousMonthLabel} onClick={onPrevious}>
        <ChevronLeftIcon aria-hidden size={16} color={theme.colors.icon.primary} />
      </IconButton>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          justifyContent: numberOfMonths === 2 ? 'space-between' : 'center',
          flex: 1,
          gap: theme.customSpacing.gap.lg,
          minWidth: 0,
        }}
      >
        <Typography
          variant="body1"
          sx={{ fontWeight: 700, textTransform: 'capitalize', textAlign: 'center', flex: 1 }}
        >
          {formatMonthCaption(displayMonth, locale)}
        </Typography>
        {numberOfMonths === 2 ? (
          <Typography
            variant="body1"
            sx={{ fontWeight: 700, textTransform: 'capitalize', textAlign: 'center', flex: 1 }}
          >
            {formatMonthCaption(secondMonth, locale)}
          </Typography>
        ) : null}
      </Stack>
      <IconButton size="small" disabled={disabled} aria-label={nextMonthLabel} onClick={onNext}>
        <ChevronRightIcon aria-hidden size={16} color={theme.colors.icon.primary} />
      </IconButton>
    </Stack>
  );
}
