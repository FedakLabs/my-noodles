'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

function DemoProductTile({ name, accent, onClick }: { name: string; accent?: string; onClick?: () => void }) {
  return (
    <Stack
      component={onClick ? 'button' : 'div'}
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      spacing={0.75}
      sx={{
        p: 1,
        borderRadius: 1.5,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        height: '100%',
        ...(onClick && {
          cursor: 'pointer',
          textAlign: 'left',
          font: 'inherit',
          color: 'inherit',
          '&:hover': { borderColor: 'primary.main' },
        }),
      }}
    >
      <Box
        sx={{
          aspectRatio: '1',
          borderRadius: 1,
          bgcolor: accent ?? 'primary.main',
          opacity: 0.22,
        }}
      />
      <Typography variant="caption" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
        {name}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        ₴89
      </Typography>
    </Stack>
  );
}

export function DemoProductGrid({
  count = 4,
  onTileClick,
}: {
  count?: number;
  onTileClick?: (name: string) => void;
}) {
  const names = [
    'Buldak Carbonara',
    'Pocky Matcha',
    'KitKat Sake',
    'Mochi Mango',
    'Samyang Cheese',
    'Oreo Matcha',
  ];

  return (
    <Grid container spacing={1}>
      {names.slice(0, count).map((name) => (
        <Grid key={name} size={6}>
          <DemoProductTile name={name} onClick={onTileClick ? () => onTileClick(name) : undefined} />
        </Grid>
      ))}
    </Grid>
  );
}

export function DemoFilterPanel() {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle2">Country</Typography>
      <FormControlLabel control={<Checkbox defaultChecked size="small" />} label="Japan (12)" />
      <FormControlLabel control={<Checkbox size="small" />} label="Korea (8)" />
      <Typography variant="subtitle2" sx={{ pt: 0.5 }}>
        Spice level
      </Typography>
      <FormControlLabel control={<Checkbox size="small" />} label="Medium (5)" />
      <Button variant="outlined" size="small" sx={{ alignSelf: 'flex-start', mt: 0.5 }}>
        Apply filters
      </Button>
    </Stack>
  );
}

export function DemoPanel({
  title,
  subtitle,
  whatToLookFor,
  children,
}: {
  title: string;
  subtitle: string;
  whatToLookFor: string[];
  children: ReactNode;
}) {
  return (
    <Stack
      spacing={1.5}
      sx={{
        p: 2,
        borderRadius: 2,
        border: 1,
        borderColor: 'divider',
        bgcolor: 'background.default',
        minWidth: 0,
      }}
    >
      <Stack spacing={0.5}>
        <Typography variant="subtitle2">{title}</Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Stack>

      <Box
        sx={{
          position: 'relative',
          borderRadius: 1.5,
          overflow: 'hidden',
          bgcolor: 'background.paper',
          border: 1,
          borderColor: 'divider',
          p: 1.5,
        }}
      >
        {children}
      </Box>

      <Stack component="ul" spacing={0.5} sx={{ m: 0, pl: 2.25 }}>
        {whatToLookFor.map((item) => (
          <Typography key={item} component="li" variant="caption" color="text.secondary">
            {item}
          </Typography>
        ))}
      </Stack>
    </Stack>
  );
}
