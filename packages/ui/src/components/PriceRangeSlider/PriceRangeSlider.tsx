'use client';

import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

export type PriceRangeSliderProps = {
  min: number;
  max: number;
  value: [number, number];
  onCommit: (value: [number, number]) => void;
  label: string;
  minLabel: string;
  maxLabel: string;
  valueLabelFormat?: (value: number) => string;
};

function clampRange([low, high]: [number, number], min: number, max: number): [number, number] {
  const clampedLow = Math.min(Math.max(low, min), max);
  const clampedHigh = Math.min(Math.max(high, min), max);
  return clampedLow <= clampedHigh ? [clampedLow, clampedHigh] : [clampedHigh, clampedLow];
}

export function PriceRangeSlider({
  min,
  max,
  value,
  onCommit,
  label,
  minLabel,
  maxLabel,
  valueLabelFormat,
}: PriceRangeSliderProps) {
  const [localValue, setLocalValue] = useState(value);
  const [prevValue, setPrevValue] = useState(value);

  if (value[0] !== prevValue[0] || value[1] !== prevValue[1]) {
    setPrevValue(value);
    setLocalValue(value);
  }

  const commit = (next: [number, number]) => {
    const clamped = clampRange(next, min, max);
    setLocalValue(clamped);
    onCommit(clamped);
  };

  if (max <= min) {
    return null;
  }

  return (
    <Stack spacing={2} sx={{ width: '100%', minWidth: 0 }}>
      <Typography variant="subtitle2">{label}</Typography>
      <Box
        sx={{
          width: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          px: 1.5,
        }}
      >
        <Slider
          value={localValue}
          min={min}
          max={max}
          step={1}
          onChange={(_, next) => setLocalValue(next as [number, number])}
          onChangeCommitted={(_, next) => commit(next as [number, number])}
          valueLabelDisplay="auto"
          valueLabelFormat={valueLabelFormat}
          getAriaLabel={(index) => (index === 0 ? minLabel : maxLabel)}
          sx={{
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            py: 1.625,
            px: 0,
          }}
        />
      </Box>
      <Stack direction="row" spacing={1} sx={{ width: '100%', minWidth: 0 }}>
        <TextField
          label={minLabel}
          type="number"
          size="small"
          value={localValue[0]}
          onChange={(event) => setLocalValue([Number(event.target.value), localValue[1]])}
          onBlur={() => commit(localValue)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commit(localValue);
            }
          }}
          fullWidth
          sx={{ minWidth: 0 }}
        />
        <TextField
          label={maxLabel}
          type="number"
          size="small"
          value={localValue[1]}
          onChange={(event) => setLocalValue([localValue[0], Number(event.target.value)])}
          onBlur={() => commit(localValue)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              commit(localValue);
            }
          }}
          fullWidth
          sx={{ minWidth: 0 }}
        />
      </Stack>
    </Stack>
  );
}
