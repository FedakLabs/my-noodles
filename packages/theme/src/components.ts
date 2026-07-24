import type { Components } from '@mui/material/styles';

import { baseColors, colors } from './palette';
import { scrollbarStyles } from './scrollbars';
import { cardShadow, sheetShadow } from './shadows';
import { borderRadius, edgeAnchoredBorderRadius } from './shape';
import { spacingUnit } from './spacing';

/**
 * Hover/focus fill easing for interactive controls only.
 * Do not put this on `*` / layout surfaces — that animates sheets and page chrome.
 * Matches MUI `transitions.duration.short` + standard easing.
 */
const interactiveFillTransition =
  'background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1)';

export const components: Components = {
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        backgroundColor: colors.surface.page,
        color: colors.text.primary,
      },
      '*': scrollbarStyles(),
    },
  },
  MuiButtonBase: {
    styleOverrides: {
      root: {
        transition: interactiveFillTransition,
      },
    },
  },
  MuiButton: {
    defaultProps: {
      disableElevation: true,
    },
    styleOverrides: {
      root: {
        borderRadius: borderRadius.pill,
        fontWeight: 600,
        textTransform: 'none',
        minHeight: 44,
        paddingInline: spacingUnit * 3,
        transition: interactiveFillTransition,
      },
    },
    variants: [
      {
        props: { variant: 'contained', color: 'primary' },
        style: {
          backgroundColor: colors.buttonFill.primary,
          '&:hover': {
            backgroundColor: colors.buttonFill.primaryHover,
          },
        },
      },
      {
        props: { variant: 'outlined' },
        style: {
          borderColor: colors.border.subtle,
          color: colors.text.primary,
        },
      },
      {
        props: { variant: 'tertiary' },
        style: {
          backgroundColor: 'transparent',
          color: colors.buttonFill.primary,
          paddingInline: 0,
          width: 'fit-content',
          minWidth: 'unset',
          '&.MuiButton-fullWidth': {
            width: 'fit-content',
          },
          '&:hover': {
            backgroundColor: baseColors.terracottaLight,
          },
        },
      },
    ],
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.utility,
        minWidth: 44,
        minHeight: 44,
        transition: interactiveFillTransition,
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        transition: interactiveFillTransition,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.utility,
        fontWeight: 600,
        transition: interactiveFillTransition,
      },
      filled: {
        backgroundColor: colors.buttonFill.primary,
        color: colors.text.inverse,
      },
      outlined: {
        borderColor: colors.border.subtle,
      },
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.utility,
        backgroundColor: colors.surface.card,
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: colors.border.subtle,
        },
        '& .MuiOutlinedInput-notchedOutline legend > span': {
          display: 'inline-block',
          maxWidth: '100%',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          paddingInline: '4px',
        },
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: colors.border.strong,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: colors.border.focus,
          borderWidth: 2,
        },
      },
      input: {
        boxSizing: 'border-box',
      },
    },
    variants: [
      {
        props: { size: 'small' },
        style: {
          minHeight: 40,
          fontSize: '0.875rem',
          '& .MuiOutlinedInput-input': {
            padding: '8px 12px',
          },
        },
      },
      {
        props: { size: 'medium' },
        style: {
          minHeight: 48,
          fontSize: '1rem',
          '& .MuiOutlinedInput-input': {
            padding: '12px 14px',
          },
        },
      },
      {
        props: { size: 'large' },
        style: {
          minHeight: 56,
          fontSize: '1.0625rem',
          '& .MuiOutlinedInput-input': {
            padding: '16px 14px',
          },
        },
      },
    ],
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        transition:
          'color 200ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1), top 300ms cubic-bezier(0.4, 0, 0.2, 1), max-width 300ms cubic-bezier(0.4, 0, 0.2, 1)',
        '&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
          transform: 'translate(14px, -50%)',
          transformOrigin: 'left center',
        },
        '&.MuiInputLabel-outlined.MuiInputLabel-shrink': {
          transformOrigin: 'left top',
          maxWidth: 'calc(100% - 24px)',
        },
      },
    },
    variants: [
      {
        props: { size: 'small' },
        style: {
          '&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
            top: 20,
          },
        },
      },
      {
        props: { size: 'medium' },
        style: {
          '&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
            top: 24,
          },
        },
      },
      {
        props: { size: 'large' },
        style: {
          '&.MuiInputLabel-outlined:not(.MuiInputLabel-shrink)': {
            top: 28,
          },
        },
      },
    ],
  },
  MuiFormControl: {
    styleOverrides: {
      root: {
        verticalAlign: 'top',
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
      size: 'medium',
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.none,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundColor: colors.surface.card,
        borderRadius: borderRadius.discovery,
        border: `1px solid ${colors.border.subtle}`,
        boxShadow: cardShadow,
      },
      elevation0: {
        boxShadow: 'none',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.discovery,
        border: `1px solid ${colors.border.subtle}`,
        boxShadow: cardShadow,
        backgroundColor: colors.surface.card,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: borderRadius.sheet,
        border: `1px solid ${colors.border.subtle}`,
        boxShadow: sheetShadow,
        backgroundColor: colors.surface.elevated,
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ ownerState }) => ({
        borderRadius: borderRadius.none,
        border: `1px solid ${colors.border.subtle}`,
        boxShadow: sheetShadow,
        backgroundColor: colors.surface.elevated,
        ...(ownerState.anchor === 'bottom' && {
          ...edgeAnchoredBorderRadius('bottom'),
          borderBottom: 'none',
        }),
        ...(ownerState.anchor === 'right' && {
          ...edgeAnchoredBorderRadius('right'),
          borderRight: 'none',
        }),
        ...(ownerState.anchor === 'left' && {
          ...edgeAnchoredBorderRadius('left'),
          borderLeft: 'none',
        }),
        ...(ownerState.anchor === 'top' && {
          ...edgeAnchoredBorderRadius('top'),
          borderTop: 'none',
        }),
      }),
    },
  },
};
