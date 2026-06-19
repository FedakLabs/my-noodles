import '@mui/material/themeCssVarsAugmentation';

import { createTheme as muiCreateTheme } from '@mui/material/styles';

import { breakpoints } from './breakpoints';
import { components } from './components';
import { colors, muiPalette } from './palette';
import { borderRadius } from './shape';
import { customSpacing, modalWidths, spacingUnit } from './spacing';
import type {} from './types';
import { typography } from './typography';

export function createTheme() {
  return muiCreateTheme({
    cssVariables: true,
    colors,
    borderRadius,
    customSpacing,
    modalWidths,
    palette: muiPalette,
    typography,
    shape: {
      borderRadius: borderRadius.utility,
    },
    spacing: spacingUnit,
    breakpoints,
    components,
  });
}

export const theme = createTheme();

export { muiCreateTheme as createThemeFromMui };
