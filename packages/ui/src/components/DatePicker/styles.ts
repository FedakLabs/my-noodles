import type { SxProps, Theme } from '@mui/material/styles';
import type { CSSProperties } from 'react';

import 'react-day-picker/style.css';

export function getDayPickerSx(theme: Theme): SxProps<Theme> {
  return {
    '& .rdp-root': {
      '--rdp-day-width': '36px',
      '--rdp-day-height': '36px',
      '--rdp-day_button-width': '36px',
      '--rdp-day_button-height': '36px',
      '--rdp-day_button-border-radius': `${theme.borderRadius.utility}px`,
      '--rdp-selected-border': 'none',
      '--rdp-weekday-opacity': 1,
      '--rdp-accent-color': theme.colors.buttonFill.primary,
      '--rdp-accent-background-color': theme.palette.primary.light,
      '--rdp-range_middle-background-color': theme.palette.primary.light,
      '--rdp-range_start-date-background-color': theme.colors.buttonFill.primary,
      '--rdp-range_end-date-background-color': theme.colors.buttonFill.primary,
      '--rdp-range_start-color': theme.colors.text.inverse,
      '--rdp-range_end-color': theme.colors.text.inverse,
      '--rdp-months-gap': `${theme.spacing(theme.customSpacing.gap.lg)}`,
    } as CSSProperties,
    '& .rdp-weekday': {
      ...theme.typography.body2,
      color: theme.colors.text.secondary,
      textTransform: 'capitalize',
    },
    '& .rdp-day_button': {
      ...theme.typography.body2,
      color: theme.colors.text.primary,
    },
    '& .rdp-month_caption, & .rdp-nav': {
      display: 'none',
    },
    '& .rdp-selected .rdp-day_button, & .rdp-range_start .rdp-day_button, & .rdp-range_end .rdp-day_button': {
      color: theme.colors.text.inverse,
    },
    '& .rdp-week .rdp-day:first-of-type.rdp-range_middle': {
      borderTopLeftRadius: theme.borderRadius.utility,
      borderBottomLeftRadius: theme.borderRadius.utility,
    },
    '& .rdp-week .rdp-day:last-of-type.rdp-range_middle': {
      borderTopRightRadius: theme.borderRadius.utility,
      borderBottomRightRadius: theme.borderRadius.utility,
    },
  };
}
