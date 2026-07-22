'use client';

import Box from '@mui/material/Box';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import { alpha } from '@mui/material/styles';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import type { Order } from '@/api/checkouts';

type OrderStatus = Order['status'];
type ProgressStatus = 'new' | 'confirmed' | 'sent' | 'arrived' | 'completed' | 'cancelled' | 'returned';

type ConnectorMode = 'full' | 'half' | 'empty';

const HAPPY_PATH_MIDDLE = ['confirmed', 'sent', 'arrived'] as const;

export function buildOrderStatusSteps(status: OrderStatus): ProgressStatus[] {
  const end: ProgressStatus = status === 'cancelled' || status === 'returned' ? status : 'completed';
  return ['new', ...HAPPY_PATH_MIDDLE, end];
}

export function resolveOrderStatusStepIndex(status: OrderStatus, steps: ProgressStatus[]): number {
  if (status === 'draft' || status === 'archived') {
    return 0;
  }

  const index = steps.indexOf(status as ProgressStatus);
  return index >= 0 ? index : 0;
}

function connectorMode(index: number, currentIndex: number, stepCount: number): ConnectorMode {
  if (index + 1 <= currentIndex) {
    return 'full';
  }
  if (index === currentIndex && currentIndex < stepCount - 1) {
    return 'half';
  }
  return 'empty';
}

function StatusConnector({ mode }: { mode: ConnectorMode }) {
  return (
    <Box
      aria-hidden
      sx={{
        flex: 1,
        height: mode === 'empty' ? 2 : 4,
        mx: 0.75,
        borderRadius: (theme) => `${theme.borderRadius.pill}px`,
        bgcolor: 'divider',
        overflow: 'hidden',
        position: 'relative',
        alignSelf: 'center',
      }}
    >
      {mode === 'full' || mode === 'half' ? (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            width: mode === 'half' ? '50%' : '100%',
            bgcolor: 'primary.main',
          }}
        />
      ) : null}
    </Box>
  );
}

type StatusDotProps = {
  label: string;
  isCurrent: boolean;
  isNext: boolean;
  filled: boolean;
  dotSize: number;
  dotColor: string;
  tooltipOpen: boolean;
  onToggleTooltip: () => void;
};

function StatusDot({
  label,
  isCurrent,
  isNext,
  filled,
  dotSize,
  dotColor,
  tooltipOpen,
  onToggleTooltip,
}: StatusDotProps) {
  const hitSize = isCurrent ? dotSize : 28;

  const dot = (
    <Box
      component="span"
      tabIndex={isCurrent ? undefined : 0}
      aria-current={isCurrent ? 'step' : undefined}
      aria-label={label}
      onClick={isCurrent ? undefined : onToggleTooltip}
      onKeyDown={
        isCurrent
          ? undefined
          : (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onToggleTooltip();
              }
            }
      }
      sx={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: hitSize,
        height: hitSize,
        margin: isCurrent ? 0 : `${-(hitSize - dotSize) / 2}px`,
        borderRadius: (theme) => `${theme.borderRadius.pill}px`,
        cursor: isCurrent ? undefined : 'pointer',
        outline: 'none',
        flexShrink: 0,
        ...(isNext
          ? {
              '@keyframes orderStatusNextPulse': {
                '0%': {
                  transform: 'scale(1)',
                  opacity: 0.7,
                },
                '100%': {
                  transform: 'scale(2.25)',
                  opacity: 0,
                },
              },
              '@media (prefers-reduced-motion: reduce)': {
                '&::before': { animation: 'none', opacity: 0 },
              },
            }
          : null),
        // Outward ring that fades away; the circle itself stays still.
        '&::before': isNext
          ? {
              content: '""',
              position: 'absolute',
              width: dotSize,
              height: dotSize,
              borderRadius: (theme) => `${theme.borderRadius.pill}px`,
              border: 2,
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.75),
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.18),
              animation: 'orderStatusNextPulse 1.5s ease-out infinite',
              pointerEvents: 'none',
            }
          : undefined,
        '&::after': {
          content: '""',
          position: 'relative',
          zIndex: 1,
          display: 'block',
          width: dotSize,
          height: dotSize,
          borderRadius: (theme) => `${theme.borderRadius.pill}px`,
          bgcolor: filled ? dotColor : 'background.paper',
          border: 2,
          borderColor: filled ? dotColor : 'text.disabled',
          boxShadow: isCurrent ? (theme) => `0 0 0 3px ${theme.palette.action.selected}` : undefined,
        },
      }}
    />
  );

  if (isCurrent) {
    return dot;
  }

  return (
    <Tooltip
      title={label}
      describeChild
      open={tooltipOpen}
      disableHoverListener
      disableFocusListener
      disableTouchListener
      slotProps={{
        popper: {
          disablePortal: true,
        },
      }}
    >
      {dot}
    </Tooltip>
  );
}

type OrderStatusProgressProps = {
  status: OrderStatus;
};

export function OrderStatusProgress({ status }: OrderStatusProgressProps) {
  const tSuccess = useTranslations('checkout.success');
  const t = useTranslations('checkout.success.status');
  const steps = buildOrderStatusSteps(status);
  const currentIndex = resolveOrderStatusStepIndex(status, steps);
  const isTerminalError = status === 'cancelled' || status === 'returned';
  const [openStep, setOpenStep] = useState<ProgressStatus | null>(null);

  return (
    <ClickAwayListener onClickAway={() => setOpenStep(null)}>
      <Box
        component="ol"
        aria-label={tSuccess('statusProgress')}
        sx={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          listStyle: 'none',
          m: 0,
          p: 0,
          pt: 3.5,
          px: 0.5,
        }}
      >
        {steps.map((step, index) => {
          const label = t(step);
          const isCurrent = index === currentIndex;
          const isPast = index < currentIndex;
          const isNext = index === currentIndex + 1;
          const isErrorEnd = isTerminalError && index === steps.length - 1;
          const filled = isPast || isCurrent;
          const isLast = index === steps.length - 1;
          const dotSize = isCurrent ? 14 : 10;
          const dotColor = isErrorEnd ? 'error.main' : filled ? 'primary.main' : 'divider';

          return (
            <Box
              key={step}
              component="li"
              sx={{
                display: 'flex',
                alignItems: 'center',
                flex: isLast ? '0 0 auto' : 1,
                minWidth: 0,
              }}
            >
              <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                {isCurrent ? (
                  <Typography
                    variant="caption"
                    sx={{
                      position: 'absolute',
                      left: '50%',
                      bottom: '100%',
                      transform: 'translateX(-50%)',
                      mb: 1,
                      whiteSpace: 'nowrap',
                      fontWeight: 600,
                      color: isErrorEnd ? 'error.main' : 'text.primary',
                    }}
                  >
                    {label}
                  </Typography>
                ) : null}
                <StatusDot
                  label={label}
                  isCurrent={isCurrent}
                  isNext={isNext}
                  filled={filled}
                  dotSize={dotSize}
                  dotColor={dotColor}
                  tooltipOpen={openStep === step}
                  onToggleTooltip={() => setOpenStep((current) => (current === step ? null : step))}
                />
              </Box>
              {isLast ? null : <StatusConnector mode={connectorMode(index, currentIndex, steps.length)} />}
            </Box>
          );
        })}
      </Box>
    </ClickAwayListener>
  );
}
