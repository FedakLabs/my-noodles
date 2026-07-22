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
  showWordmark?: boolean | { mobile: boolean; desktop: boolean };
  onNavigate?: () => void;
};

export function SiteLogo({
  label,
  markSize = 32,
  flexGrow = true,
  showWordmark = true,
  onNavigate,
}: SiteLogoProps) {
  const wordmarkDisplay =
    showWordmark === true
      ? undefined
      : showWordmark === false
        ? 'none'
        : {
            mobile: showWordmark.mobile ? 'inline' : 'none',
            desktop: showWordmark.desktop ? 'inline' : 'none',
          };

  return (
    <Stack
      component={Link}
      href="/catalog"
      direction="row"
      spacing={1}
      onClick={onNavigate}
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
          display: wordmarkDisplay,
        }}
      >
        {label}
      </Typography>
    </Stack>
  );
}
