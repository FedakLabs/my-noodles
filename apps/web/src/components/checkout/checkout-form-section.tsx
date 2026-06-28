'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type CheckoutFormSectionProps = {
  step: number;
  title: string;
  children: ReactNode;
  /** Muted preview — fields visible but not interactive until the prior step is done. */
  locked?: boolean;
  lockedHint?: string;
};

export function CheckoutFormSection({
  step,
  title,
  children,
  locked = false,
  lockedHint,
}: CheckoutFormSectionProps) {
  return (
    <Stack component="section" spacing={2} aria-disabled={locked || undefined}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Box
          aria-hidden
          sx={{
            width: 28,
            height: 28,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            typography: 'subtitle2',
            fontWeight: 600,
            ...(locked
              ? {
                  bgcolor: 'action.hover',
                  color: 'text.disabled',
                  border: 1,
                  borderColor: 'divider',
                }
              : {
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                }),
          }}
        >
          {step}
        </Box>

        <Typography
          variant="subtitle1"
          sx={{ flexShrink: 0, color: locked ? 'text.disabled' : 'text.primary' }}
        >
          {title}
        </Typography>

        <Divider sx={{ flex: 1, borderColor: locked ? 'action.disabled' : undefined }} />
      </Stack>

      {lockedHint ? (
        <Typography variant="body2" color="text.secondary">
          {lockedHint}
        </Typography>
      ) : null}

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
          opacity: locked ? 0.55 : 1,
          pointerEvents: locked ? 'none' : 'auto',
          transition: (theme) =>
            theme.transitions.create('opacity', { duration: theme.transitions.duration.short }),
        }}
      >
        {children}
      </Box>
    </Stack>
  );
}
