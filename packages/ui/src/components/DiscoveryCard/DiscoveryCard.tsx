'use client';

import Stack from '@mui/material/Stack';
import type { ReactNode } from 'react';

import type { SkinResult } from '../../utils/skins';
import { discoveryCardSkinStripePseudoSx } from './discovery-card-skin-stripe';
import { discoveryCardSkinStyle } from './discovery-card-skin-style';
import { DiscoveryCardActions } from './DiscoveryCardActions';
import { DiscoveryCardBody } from './DiscoveryCardBody';
import { DiscoveryCardCollapse } from './DiscoveryCardCollapse';
import { DiscoveryCardMedia } from './DiscoveryCardMedia';
import { DiscoveryCardScrollable } from './DiscoveryCardScrollable';
import { DiscoveryCardView } from './DiscoveryCardView';

export type DiscoveryCardProps = {
  skin?: SkinResult;
  children: ReactNode;
};

function DiscoveryCardRoot({ skin, children }: DiscoveryCardProps) {
  const skinStyle = discoveryCardSkinStyle(skin);

  return (
    <Stack
      spacing={1.5}
      sx={{
        position: 'relative',
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'background.paper',
        boxShadow: 1,
        height: '100%',
        width: '100%',
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
        ...(skinStyle ? discoveryCardSkinStripePseudoSx() : {}),
      }}
      style={skinStyle}
    >
      {children}
    </Stack>
  );
}

export const DiscoveryCard = Object.assign(DiscoveryCardRoot, {
  Media: DiscoveryCardMedia,
  Body: DiscoveryCardBody,
  Actions: DiscoveryCardActions,
  Collapse: DiscoveryCardCollapse,
  Scrollable: DiscoveryCardScrollable,
  View: DiscoveryCardView,
});

export type { DiscoveryCardActionsProps } from './DiscoveryCardActions';
export type { DiscoveryCardMediaProps } from './DiscoveryCardMedia';
export type { DiscoveryCardScrollableProps } from './DiscoveryCardScrollable';
