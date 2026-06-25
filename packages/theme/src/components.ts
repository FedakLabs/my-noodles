import './mui-augmentation';

import type { Components } from '@mui/material/styles';

import { baseColors, colors } from './palette';
import { scrollbarStyles } from './scrollbars';
import { cardShadow, sheetShadow } from './shadows';
import { borderRadius, edgeAnchoredBorderRadius } from './shape';
import { spacingUnit } from './spacing';

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
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: borderRadius.utility,
        fontWeight: 600,
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
        '&:hover .MuiOutlinedInput-notchedOutline': {
          borderColor: colors.border.strong,
        },
        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
          borderColor: colors.border.focus,
          borderWidth: 2,
        },
      },
      input: {
        minHeight: 44,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
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
