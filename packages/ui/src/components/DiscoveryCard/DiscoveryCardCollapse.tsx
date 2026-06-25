'use client';

import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import type { ReactNode } from 'react';

import { DISCOVERY_CARD_VIEW_TRANSITION_MS } from './DiscoveryCardView';

const collapseEasing = 'cubic-bezier(0.4, 0, 0.2, 1)';

export type DiscoveryCardCollapseProps = {
  expanded: boolean;
  children: ReactNode;
  orientation?: 'horizontal' | 'vertical';
  unmountOnExit?: boolean;
};

/** Reveals children in sync with card expand/collapse timing. */
export function DiscoveryCardCollapse({
  expanded,
  children,
  orientation = 'horizontal',
  unmountOnExit = true,
}: DiscoveryCardCollapseProps) {
  return (
    <Collapse
      in={expanded}
      orientation={orientation}
      unmountOnExit={unmountOnExit}
      timeout={{
        enter: DISCOVERY_CARD_VIEW_TRANSITION_MS,
        exit: DISCOVERY_CARD_VIEW_TRANSITION_MS,
      }}
      easing={{
        enter: collapseEasing,
        exit: collapseEasing,
      }}
      sx={{
        display: orientation === 'horizontal' ? 'inline-flex' : 'block',
        maxWidth: '100%',
      }}
    >
      <Box
        component="span"
        sx={{
          whiteSpace: orientation === 'horizontal' ? 'nowrap' : undefined,
          lineHeight: 1,
        }}
      >
        {children}
      </Box>
    </Collapse>
  );
}
