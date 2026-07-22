'use client';

import Box from '@mui/material/Box';
import { useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { ModalScrollable } from './ModalScrollable';

export type ModalBodyProps = {
  children: ReactNode;
  scrollable?: boolean;
};

export function ModalBody({ children, scrollable = false }: ModalBodyProps) {
  const theme = useTheme();

  const content = (
    <Box
      sx={{
        px: theme.customSpacing.padding.md,
        py: theme.customSpacing.padding.sm,
      }}
    >
      {children}
    </Box>
  );

  if (scrollable) {
    return <ModalScrollable>{content}</ModalScrollable>;
  }

  return content;
}
