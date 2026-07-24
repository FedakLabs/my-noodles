import type { ThemeOptions } from '@mui/material/styles';

import { fontCssVariableReference } from './fonts';

export const fontFamilies = {
  display: fontCssVariableReference('display'),
  body: fontCssVariableReference('body'),
} as const;

export const typography: NonNullable<ThemeOptions['typography']> = {
  h1: {
    fontFamily: fontFamilies.display,
    fontWeight: 700,
    fontSize: '2rem',
    lineHeight: 1.2,
  },
  h2: {
    fontFamily: fontFamilies.display,
    fontWeight: 700,
    fontSize: '1.5rem',
    lineHeight: 1.25,
  },
  h3: {
    fontFamily: fontFamilies.display,
    fontWeight: 700,
    fontSize: '1.25rem',
    lineHeight: 1.3,
  },
  h4: {
    fontFamily: fontFamilies.display,
    fontWeight: 700,
    fontSize: '1.125rem',
    lineHeight: 1.35,
  },
  h5: {
    fontFamily: fontFamilies.display,
    fontWeight: 700,
    fontSize: '1rem',
    lineHeight: 1.4,
  },
  h6: {
    fontFamily: fontFamilies.display,
    fontWeight: 700,
    fontSize: '0.875rem',
    lineHeight: 1.45,
  },
  body1: {
    fontFamily: fontFamilies.body,
    fontSize: '1rem',
    lineHeight: 1.5,
  },
  body2: {
    fontFamily: fontFamilies.body,
    fontSize: '0.875rem',
    lineHeight: 1.5,
  },
  subtitle1: {
    fontFamily: fontFamilies.body,
    fontWeight: 600,
    fontSize: '1rem',
    lineHeight: 1.4,
  },
  subtitle2: {
    fontFamily: fontFamilies.body,
    fontWeight: 600,
    fontSize: '0.875rem',
    lineHeight: 1.4,
  },
  button: {
    fontFamily: fontFamilies.body,
    fontWeight: 600,
    fontSize: '0.9375rem',
    lineHeight: 1.5,
    textTransform: 'none',
  },
  caption: {
    fontFamily: fontFamilies.body,
    fontSize: '0.75rem',
    lineHeight: 1.4,
  },
  overline: {
    fontFamily: fontFamilies.body,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'none',
  },
  actions: {
    fontFamily: fontFamilies.body,
    fontWeight: 600,
    fontSize: '0.9375rem',
    lineHeight: 1.5,
  },
};
