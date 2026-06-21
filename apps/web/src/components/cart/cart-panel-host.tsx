'use client';

import Drawer from '@mui/material/Drawer';

import { useCartActions, useCartPanelOpen } from '@/hooks/cart';

import { CartPanel } from './cart-panel';

const drawerPaperSx = {
  mobile: {
    maxHeight: '85dvh',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  desktop: {
    width: '100%',
    maxWidth: 400,
    height: '100%',
  },
} as const;

export function CartPanelHost() {
  const panelOpen = useCartPanelOpen();
  const { closePanel } = useCartActions();

  return (
    <>
      <Drawer
        anchor="bottom"
        open={panelOpen}
        onClose={closePanel}
        sx={{ display: { xs: 'block', md: 'none' } }}
        slotProps={{ paper: { sx: drawerPaperSx.mobile } }}
      >
        <CartPanel onClose={closePanel} />
      </Drawer>

      <Drawer
        anchor="right"
        open={panelOpen}
        onClose={closePanel}
        sx={{ display: { xs: 'none', md: 'block' } }}
        slotProps={{ paper: { sx: drawerPaperSx.desktop } }}
      >
        <CartPanel onClose={closePanel} />
      </Drawer>
    </>
  );
}
