import '@mui/material/Button';

declare module '@mui/material/Button' {
  interface ButtonPropsVariantOverrides {
    tertiary: true;
  }
}
