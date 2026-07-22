'use client';

import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';

const FOOTER_MIN_HEIGHT = 56;

export type ModalFooterAlign = 'start' | 'center' | 'end' | 'space-between';

export type ModalFooterProps = {
  children: ReactNode;
  align?: ModalFooterAlign;
};

const justifyContentByAlign: Record<ModalFooterAlign, string> = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  'space-between': 'space-between',
};

export function ModalFooter({ children, align = 'end' }: ModalFooterProps) {
  const theme = useTheme();

  return (
    <Stack
      direction="row"
      spacing={theme.customSpacing.gap.sm}
      useFlexGap
      sx={{
        alignItems: 'center',
        justifyContent: justifyContentByAlign[align],
        minHeight: FOOTER_MIN_HEIGHT,
        px: theme.customSpacing.padding.md,
        py: theme.customSpacing.padding.sm,
        flexShrink: 0,
        flexWrap: 'wrap',
        borderTop: `1px solid ${theme.colors.border.subtle}`,
      }}
    >
      {children}
    </Stack>
  );
}
