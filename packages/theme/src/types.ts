import type { CSSProperties } from 'react';

export type Colors = {
  text: {
    primary: string;
    secondary: string;
    disabled: string;
    inverse: string;
  };
  icon: {
    primary: string;
    secondary: string;
    accent: string;
  };
  surface: {
    page: string;
    card: string;
    elevated: string;
    bgHueBrand: number;
  };
  border: {
    subtle: string;
    strong: string;
    focus: string;
  };
  buttonFill: {
    primary: string;
    primaryHover: string;
    secondary: string;
    disabled: string;
  };
};

export type BorderRadiusTokens = {
  none: number;
  utility: number;
  discovery: number;
  sheet: number;
  pill: number;
};

export type CustomSpacing = {
  gap: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  padding: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
};

export type ModalWidths = {
  sm: number;
  md: number;
  lg: number;
};

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    mobile: true;
    desktop: true;
  }

  interface Theme {
    colors: Colors;
    borderRadius: BorderRadiusTokens;
    customSpacing: CustomSpacing;
    modalWidths: ModalWidths;
  }

  interface ThemeOptions {
    colors?: Colors;
    borderRadius?: BorderRadiusTokens;
    customSpacing?: CustomSpacing;
    modalWidths?: ModalWidths;
  }

  interface TypographyVariants {
    actions: CSSProperties;
  }

  interface TypographyVariantsOptions {
    actions?: CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    actions: true;
  }
}
