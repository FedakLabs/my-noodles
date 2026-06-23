import type { CSSObject } from '@mui/material/styles';

import { colors } from './palette';
import { borderRadius } from './shape';

/** Warm, thin scrollbars for all scrollable surfaces — applied globally via CssBaseline. */
export function scrollbarStyles(): CSSObject {
  const thumb = colors.border.strong;
  const thumbHover = colors.text.secondary;

  return {
    scrollbarWidth: 'thin',
    scrollbarColor: `${thumb} transparent`,
    '&::-webkit-scrollbar': {
      width: 8,
      height: 8,
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: thumb,
      borderRadius: borderRadius.pill,
      border: '2px solid transparent',
      backgroundClip: 'padding-box',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: thumbHover,
    },
  };
}
