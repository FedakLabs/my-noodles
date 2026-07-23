'use client';

import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

import ChevronLeftIcon from '../../icons/chevron-left.svg';
import CloseIcon from '../../icons/close.svg';
import { useModalContext } from './modal-context';

export type ModalHeaderProps = {
  /** Plain string gets `h6` styling; pass a node for custom title content (e.g. copyable id). */
  title?: ReactNode;
  /**
   * When set, shows a left-arrow control before the title (native drill-down back).
   * Does not close the modal — caller decides navigation.
   */
  onBack?: () => void;
  /** Accessible label for the back control. Defaults to `"Back"`. */
  backLabel?: string;
  hideCloseButton?: boolean;
  children?: ReactNode;
};

export function ModalHeader({
  title,
  onBack,
  backLabel = 'Back',
  hideCloseButton = false,
  children,
}: ModalHeaderProps) {
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
      {onBack ? (
        <IconButton aria-label={backLabel} size="small" onClick={onBack} sx={{ flexShrink: 0 }}>
          <ChevronLeftIcon aria-hidden size={20} color={theme.colors.icon.secondary} />
        </IconButton>
      ) : null}
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
