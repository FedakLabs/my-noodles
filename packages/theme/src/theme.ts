import '@mui/material/themeCssVarsAugmentation';
import { createTheme } from '@mui/material/styles';

import { breakpoints } from './breakpoints';
import { components } from './components';
import { colors, muiPalette } from './palette';
import { borderRadius } from './shape';
import { customSpacing, modalWidths, spacingUnit } from './spacing';
import { typography } from './typography';

export const MyNoodlesTheme = createTheme({
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
