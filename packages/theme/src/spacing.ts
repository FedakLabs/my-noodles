import type { CustomModalWidths, CustomSpacing } from '../types/theme.d.ts';

export const customSpacing: CustomSpacing = {
  gap: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
  },
  padding: {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
  },
};

export const modalWidths: CustomModalWidths = {
  sm: 400,
  md: 560,
  lg: 720,
  xl: 960,
};

/** MUI spacing unit — 8px base. */
export const spacingUnit = 8;
