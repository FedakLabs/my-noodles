import { create } from 'zustand';

type CartPanelState = {
  panelOpen: boolean;
  panelOpenNonce: number;
  openPanelIfFirstAdd: (wasEmpty: boolean) => void;
  openPanel: () => void;
  closePanel: () => void;
  beginCheckout: () => void;
};

export const useCartStore = create<CartPanelState>((set) => ({
  panelOpen: false,
  panelOpenNonce: 0,
  openPanelIfFirstAdd: (wasEmpty) => {
    if (!wasEmpty) {
      return;
    }

    set((state) => ({
      panelOpen: true,
      panelOpenNonce: state.panelOpen ? state.panelOpenNonce : state.panelOpenNonce + 1,
    }));
  },
  openPanel: () =>
    set((state) => ({
      panelOpen: true,
      panelOpenNonce: state.panelOpen ? state.panelOpenNonce : state.panelOpenNonce + 1,
    })),
  closePanel: () => set({ panelOpen: false }),
  beginCheckout: () => set({ panelOpen: false }),
}));
