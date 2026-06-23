'use client';

import Box from '@mui/material/Box';
import type { SxProps, Theme } from '@mui/material/styles';
import type { ReactNode } from 'react';

import { BusyDim } from './BusyDim';
import { BusyScrim } from './BusyScrim';
import { type BusyAreaState, type BusyAreaTimingOptions, useBusyAreaState } from './use-busy-area-state';

export type BusyAreaProps = {
  label: string;
  children: ReactNode;
  /** Drives internal timing when `timing` is not passed. */
  busy?: boolean;
  /** Shared timing from `useBusyAreaState` — avoids duplicate hooks in one screen. */
  timing?: BusyAreaState;
  /** Gates dim + scrim visibility; defaults to timing `active`. Timing still runs. */
  show?: boolean;
  /** Fade wrapped children (~65% opacity). Default `true`. */
  dim?: boolean;
  /** Flat overlay on top; carries aria-busy. Default `true`. */
  scrim?: boolean;
  blockInteraction?: boolean;
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
  blockInteraction = false,
  borderRadius = 1,
  position = 'absolute',
  top = 0,
  zIndex = 1,
  sx,
  resolvedTiming,
}: BusyAreaBodyProps) {
  const { mounted, active, transitionMs, transitionEasing } = resolvedTiming;
  const chromeVisible = show ?? active;
  const dimActive = dim && chromeVisible;
  const scrimVisible = scrim && chromeVisible;

  const regionSx: SxProps<Theme> = {
    position: 'relative',
    ...(blockInteraction && {
      pointerEvents: chromeVisible ? 'none' : 'auto',
    }),
  };

  const content = (
    <>
      {children}
      {scrim && mounted ? (
        <BusyScrim
          visible={scrimVisible}
          label={label}
          transitionMs={transitionMs}
          transitionEasing={transitionEasing}
          position={position}
          top={top}
          zIndex={zIndex}
          borderRadius={borderRadius}
        />
      ) : null}
    </>
  );

  if (!dim) {
    return <Box sx={sx ? ([regionSx, sx] as SxProps<Theme>) : regionSx}>{content}</Box>;
  }

  return (
    <BusyDim
      active={dimActive}
      transitionMs={transitionMs}
      transitionEasing={transitionEasing}
      sx={sx ? ([regionSx, sx] as SxProps<Theme>) : regionSx}
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
