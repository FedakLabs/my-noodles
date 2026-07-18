'use client';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { BusyDim } from './BusyDim';
import { BusyScrim } from './BusyScrim';
import { BUSY_SCRIM_Z_INDEX } from './tokens';
import { type BusyAreaState, type BusyAreaTimingOptions, useBusyAreaState } from './use-busy-area-state';

export type BusyAreaProps = {
  label: string;
  children: ReactNode;
  /** Drives internal timing when `timing` is not passed. */
  busy?: boolean;
  /** Shared timing from `useBusyAreaState` — avoids duplicate hooks in one screen. */
  timing?: BusyAreaState;
  /** Gates dim + scrim; defaults to timing `active`. Timing still runs. */
  show?: boolean;
  /** Fade wrapped children (~65% opacity). Default `true`. */
  dim?: boolean;
  /** Invisible click shield on top + blocks children. Default `true`. No extra tint. */
  scrim?: boolean;
  borderRadius?: number;
  position?: 'absolute' | 'fixed';
  top?: number | string;
  zIndex?: number;
  sx?: SxProps<Theme>;
  timingOptions?: BusyAreaTimingOptions;
};

type BusyAreaBodyProps = BusyAreaProps & {
  resolvedTiming: BusyAreaState;
};

function BusyAreaBody({
  label,
  children,
  show,
  dim = true,
  scrim = true,
  borderRadius = 1,
  position = 'absolute',
  top = 0,
  zIndex = BUSY_SCRIM_Z_INDEX,
  sx,
  resolvedTiming,
}: BusyAreaBodyProps) {
  const { mounted, active, transitionMs, transitionEasing } = resolvedTiming;
  const chromeVisible = show ?? active;
  const dimActive = dim && chromeVisible;
  const scrimActive = scrim && (mounted || chromeVisible);

  const regionSx: SxProps<Theme> = {
    position: 'relative',
    ...(scrim && {
      pointerEvents: scrimActive ? 'none' : 'auto',
    }),
  };

  const content = (
    <>
      {children}
      {scrimActive ? (
        <BusyScrim
          blocking
          label={label}
          position={position}
          top={top}
          zIndex={zIndex}
          borderRadius={borderRadius}
        />
      ) : null}
    </>
  );

  const regionSxList = [regionSx, ...(Array.isArray(sx) ? sx : sx != null ? [sx] : [])];

  if (!dim) {
    return <Box sx={regionSxList as SxProps<Theme>}>{content}</Box>;
  }

  return (
    <BusyDim
      active={dimActive}
      transitionMs={transitionMs}
      transitionEasing={transitionEasing}
      sx={regionSxList as SxProps<Theme>}
    >
      {content}
    </BusyDim>
  );
}

function BusyAreaWithHook({ busy = false, timingOptions, ...rest }: BusyAreaProps) {
  const resolvedTiming = useBusyAreaState(busy, timingOptions);
  return <BusyAreaBody {...rest} busy={busy} timingOptions={timingOptions} resolvedTiming={resolvedTiming} />;
}

/** Wrap any region that should look busy — configure with `dim`, `scrim`, and `show`. */
export function BusyArea({ timing, busy, ...rest }: BusyAreaProps) {
  if (timing != null) {
    return <BusyAreaBody {...rest} busy={busy} timing={timing} resolvedTiming={timing} />;
  }

  return <BusyAreaWithHook busy={busy} {...rest} />;
}
