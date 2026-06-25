'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import { Fragment, type ReactNode } from 'react';

export type DiscoveryCardActionsProps = {
  actions: ReactNode[];
};

type GroupedCornerRadius = {
  borderRadius: number | string;
  borderTopLeftRadius: number | string;
  borderTopRightRadius: number | string;
  borderBottomLeftRadius: number | string;
  borderBottomRightRadius: number | string;
};

const groupedControlStartRadius: GroupedCornerRadius = {
  borderRadius: '0 !important',
  borderTopLeftRadius: 'inherit !important',
  borderBottomLeftRadius: 'inherit !important',
  borderTopRightRadius: '0 !important',
  borderBottomRightRadius: '0 !important',
};

const groupedControlMiddleRadius: GroupedCornerRadius = {
  borderRadius: '0 !important',
  borderTopLeftRadius: '0 !important',
  borderBottomLeftRadius: '0 !important',
  borderTopRightRadius: '0 !important',
  borderBottomRightRadius: '0 !important',
};

const groupedControlEndRadius: GroupedCornerRadius = {
  borderRadius: '0 !important',
  borderTopRightRadius: 'inherit !important',
  borderBottomRightRadius: 'inherit !important',
  borderTopLeftRadius: '0 !important',
  borderBottomLeftRadius: '0 !important',
};

function groupedButtonRadiusStates(radius: GroupedCornerRadius) {
  return {
    ...radius,
    overflow: 'hidden',
    '&:hover': radius,
    '&:active': radius,
    '&.Mui-focusVisible': radius,
    '&.Mui-disabled': radius,
  };
}

/** Merge onto the leading grouped action (details / go-to-product). */
export const discoveryCardGroupedDetailsButtonSx = groupedButtonRadiusStates(groupedControlStartRadius);

/** Merge onto the trailing grouped action (cart). */
export const discoveryCardGroupedCartButtonSx = groupedButtonRadiusStates(groupedControlEndRadius);

const actionButtonSx = {
  flex: '1 1 0',
  minWidth: 0,
  justifyContent: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
} as const;

function resolveGroupedButtonSx(index: number, total: number) {
  const radius =
    total <= 1
      ? {}
      : index === 0
        ? groupedButtonRadiusStates(groupedControlStartRadius)
        : index === total - 1
          ? groupedButtonRadiusStates(groupedControlEndRadius)
          : groupedButtonRadiusStates(groupedControlMiddleRadius);

  return { ...actionButtonSx, ...radius };
}

export function DiscoveryCardActions({ actions }: DiscoveryCardActionsProps) {
  if (actions.length === 0) {
    return null;
  }

  return (
    <Box sx={{ mt: 'auto', flexShrink: 0, width: '100%' }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'stretch',
          width: '100%',
          minWidth: 0,
          maxWidth: '100%',
          borderRadius: 1.5,
          overflow: 'hidden',
          border: 1,
          borderColor: 'divider',
          '& > .MuiButtonBase-root:first-of-type': groupedButtonRadiusStates(groupedControlStartRadius),
          '& > .MuiButtonBase-root:last-of-type': groupedButtonRadiusStates(groupedControlEndRadius),
          '& > .MuiButtonBase-root:not(:first-of-type):not(:last-of-type)':
            groupedButtonRadiusStates(groupedControlMiddleRadius),
          '& > .MuiButtonBase-root': actionButtonSx,
        }}
      >
        {actions.map((action, index) => (
          <Fragment key={index}>
            {index > 0 ? <Divider orientation="vertical" flexItem /> : null}
            <Box
              sx={{
                display: 'contents',
                flex: '1 1 0',
                minWidth: 0,
                '& > .MuiButtonBase-root': resolveGroupedButtonSx(index, actions.length),
              }}
            >
              {action}
            </Box>
          </Fragment>
        ))}
      </Box>
    </Box>
  );
}
