import type { PaletteOptions } from '@mui/material/styles';

import type { CustomColors } from '../types/theme.d.ts';

/** Raw hex — never use in components; Storybook dev reference only. */
export const baseColors = {
  parchment: '#FBF7F2',
  white: '#FFFFFF',
  warmGray100: '#E8E0D8',
  warmGray400: '#A69E96',
  warmGray600: '#6B635C',
  warmGray900: '#1A1614',
  terracotta: '#E85D4C',
  terracottaHover: '#D14E3E',
  terracottaLight: '#FDF0EE',
  borderStrong: '#D4CCC4',
  gold: '#D4A853',
  rose: '#E84A8A',
  mango: '#E8A317',
  teal: '#2A9D8F',
  cherry: '#DC2626',
  navy: '#1E3A5F',
  maple: '#D97706',
  pine: '#2D6A4F',
  bubbleTea: '#F472B6',
  jade: '#40916C',
  violet: '#9D4EDD',
} as const;

export const colors: CustomColors = {
  text: {
    primary: baseColors.warmGray900,
    secondary: baseColors.warmGray600,
    disabled: baseColors.warmGray400,
    inverse: baseColors.white,
  },
  icon: {
    primary: baseColors.warmGray900,
    secondary: baseColors.warmGray600,
    accent: baseColors.terracotta,
  },
  surface: {
    page: baseColors.parchment,
    card: baseColors.white,
    elevated: baseColors.white,
    bgHueBrand: 8,
  },
  border: {
    subtle: baseColors.warmGray100,
    strong: baseColors.borderStrong,
    focus: baseColors.terracotta,
  },
  buttonFill: {
    primary: baseColors.terracotta,
    primaryHover: baseColors.terracottaHover,
    secondary: baseColors.white,
    disabled: baseColors.warmGray100,
  },
};

export const muiPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: colors.buttonFill.primary,
    dark: colors.buttonFill.primaryHover,
    light: baseColors.terracottaLight,
    contrastText: colors.text.inverse,
  },
  secondary: {
    main: colors.text.secondary,
    contrastText: colors.text.inverse,
  },
  background: {
    default: colors.surface.page,
    paper: colors.surface.card,
  },
  text: {
    primary: colors.text.primary,
    secondary: colors.text.secondary,
    disabled: colors.text.disabled,
  },
  divider: colors.border.subtle,
  error: {
    main: '#C62828',
  },
};
