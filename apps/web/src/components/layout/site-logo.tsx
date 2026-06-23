'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fontFamilies } from '@my-noodles/theme';
import MynoodlesLogo from '@my-noodles/ui/icons/mynoodles-logo.svg';

import { Link } from '@/i18n/navigation';

type SiteLogoProps = {
  label: string;
  markSize?: number;
  flexGrow?: boolean;
};

export function SiteLogo({ label, markSize = 32, flexGrow = true }: SiteLogoProps) {
  return (
    <Stack
      component={Link}
      href="/"
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        color: 'inherit',
        flexGrow: flexGrow ? 1 : undefined,
        minWidth: 0,
        textDecoration: 'none',
      }}
    >
      <MynoodlesLogo aria-hidden style={{ width: markSize, height: markSize, flexShrink: 0 }} />
      <Typography
        variant="h6"
        component="span"
        sx={{
          fontFamily: fontFamilies.display,
          fontWeight: 700,
          letterSpacing: '-0.01em',
          minWidth: 0,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}
