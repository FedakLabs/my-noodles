'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import CloseIcon from '../../icons/close.svg';
import { useModalContext } from './modal-context';

export type ModalHeaderProps = {
  /** Plain string gets `h6` styling; pass a node for custom title content (e.g. copyable id). */
  title?: ReactNode;
  hideCloseButton?: boolean;
  children?: ReactNode;
};

export function ModalHeader({ title, hideCloseButton = false, children }: ModalHeaderProps) {
  const theme = useTheme();
  const { close, disableClose, titleId } = useModalContext();

  return (
    <Stack
      direction="row"
      spacing={theme.customSpacing.gap.sm}
      sx={{
        alignItems: 'center',
        px: theme.customSpacing.padding.md,
        py: theme.customSpacing.padding.sm,
        flexShrink: 0,
        borderBottom: `1px solid ${theme.colors.border.subtle}`,
      }}
    >
      <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
        {title != null && title !== '' ? (
          typeof title === 'string' || typeof title === 'number' ? (
            <Typography id={titleId} variant="h6" component="h2">
              {title}
            </Typography>
          ) : (
            <Box id={titleId} sx={{ minWidth: 0 }}>
              {title}
            </Box>
          )
        ) : null}
        {children}
      </Stack>
      {hideCloseButton ? null : (
        <IconButton
          aria-label="Close"
          size="small"
          disabled={disableClose}
          onClick={() => {
            if (!disableClose) {
              close();
            }
          }}
          sx={{ flexShrink: 0 }}
        >
          <CloseIcon aria-hidden size={20} color={theme.colors.icon.secondary} />
        </IconButton>
      )}
    </Stack>
  );
}
