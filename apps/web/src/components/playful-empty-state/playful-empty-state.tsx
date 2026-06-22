'use client';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type PlayfulEmptyStateProps = {
  message: string;
  action?: ReactNode;
};

export function PlayfulEmptyState({ message, action }: PlayfulEmptyStateProps) {
  return (
    <Stack
      spacing={3}
      sx={{
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: { xs: 240, md: 320 },
        px: 2,
        py: 6,
      }}
    >
      <Typography
        variant="subtitle1"
        color="text.primary"
        sx={{
          maxWidth: 340,
          lineHeight: 1.55,
          fontWeight: 500,
        }}
      >
        {message}
      </Typography>

      {action}
    </Stack>
  );
}
