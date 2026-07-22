'use client';

import Typography from '@mui/material/Typography';
import { animate, useMotionValue, useMotionValueEvent } from 'motion/react';
import { useEffect, useState } from 'react';

import { useReducedMotion } from './use-reduced-motion';

type TriedByUsCountUpProps = {
  value: number;
  label: (count: number) => string;
};

export function TriedByUsCountUp({ value, label }: TriedByUsCountUpProps) {
  const reducedMotion = useReducedMotion();
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(reducedMotion ? value : 0);

  useMotionValueEvent(motionValue, 'change', (latest) => {
    setDisplay(Math.round(latest));
  });

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(value);
      return;
    }

    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: [0.22, 1, 0.36, 1],
    });

    return () => controls.stop();
  }, [motionValue, reducedMotion, value]);

  return (
    <Typography variant="h5" component="p">
      {label(display)}
    </Typography>
  );
}
