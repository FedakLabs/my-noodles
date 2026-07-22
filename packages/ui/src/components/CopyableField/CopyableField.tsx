'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { type SxProps, useTheme } from '@mui/material/styles';
import Typography, { type TypographyProps } from '@mui/material/Typography';

import { CopyButton } from './CopyButton';

export type CopyableStyledText = { text: string } & Partial<
  Pick<TypographyProps, 'variant' | 'color' | 'sx'>
>;

export type CopyableFieldProps = {
  label?: string | CopyableStyledText;
  value: string | CopyableStyledText;
  /** Text written to the clipboard; defaults to the displayed value text. */
  copyText?: string;
  copyLabel?: string;
  copiedLabel?: string;
  sx?: SxProps;
};

function resolveText(prop: string | CopyableStyledText | undefined): CopyableStyledText {
  return typeof prop === 'object' ? prop : { text: prop ?? '' };
}

export function CopyableField({ label, value, copyText, copyLabel, copiedLabel, sx }: CopyableFieldProps) {
  const theme = useTheme();

  const { text: valueText, ...valueTypographyProps } = resolveText(value);
  const { text: labelText, ...labelTypographyProps } = resolveText(label);
  const clipboardText = copyText ?? valueText;

  return (
    <Stack
      data-testid="copyable-field"
      direction="row"
      spacing={theme.customSpacing.gap.xs}
      sx={[{ alignItems: 'center' }, ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}
    >
      {labelText ? (
        <Typography
          color="text.secondary"
          variant="body2"
          {...labelTypographyProps}
          sx={{ whiteSpace: 'nowrap', ...labelTypographyProps.sx }}
        >
          {labelText}
        </Typography>
      ) : null}
      <Typography
        data-testid="copyable-field-value"
        variant="body2"
        {...valueTypographyProps}
        sx={{ display: 'inline-flex', alignItems: 'center', minWidth: 0, ...valueTypographyProps.sx }}
      >
        <Box
          component="span"
          sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', minWidth: 0 }}
        >
          {valueText || '—'}
        </Box>
        {clipboardText ? (
          <CopyButton
            value={clipboardText}
            label={copyLabel}
            copiedLabel={copiedLabel}
            sx={{ ml: 0.5, flexShrink: 0 }}
          />
        ) : null}
      </Typography>
    </Stack>
  );
}
