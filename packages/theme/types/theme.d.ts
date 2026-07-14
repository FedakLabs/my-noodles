import type { CSSProperties } from 'react';
import '@mui/material/Autocomplete';
import '@mui/material/Button';
import '@mui/material/FormControl';
import '@mui/material/InputBase';
import '@mui/material/InputLabel';
import '@mui/material/OutlinedInput';
import '@mui/material/Select';
import '@mui/material/TextField';
import '@mui/material/Typography';

export type CustomColors = {
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

export type CustomBorderRadius = {
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

export type CustomModalWidths = {
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
    colors: CustomColors;
    borderRadius: CustomBorderRadius;
    customSpacing: CustomSpacing;
    modalWidths: CustomModalWidths;
  }

  interface ThemeOptions {
    colors?: CustomColors;
    borderRadius?: CustomBorderRadius;
    customSpacing?: CustomSpacing;
    modalWidths?: CustomModalWidths;
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

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    tertiary: true;
  }
}

declare module '@mui/material/InputBase' {
  interface InputBasePropsSizeOverrides {
    large: true;
  }
}

declare module '@mui/material/TextField' {
  interface TextFieldPropsSizeOverrides {
    large: true;
  }
}

declare module '@mui/material/OutlinedInput' {
  interface OutlinedInputPropsSizeOverrides {
    large: true;
  }
}

declare module '@mui/material/InputLabel' {
  interface InputLabelPropsSizeOverrides {
    large: true;
  }
}

declare module '@mui/material/FormControl' {
  interface FormControlPropsSizeOverrides {
    large: true;
  }
}

declare module '@mui/material/Select' {
  interface SelectPropsSizeOverrides {
    large: true;
  }
}

declare module '@mui/material/Autocomplete' {
  interface AutocompletePropsSizeOverrides {
    large: true;
  }
}
