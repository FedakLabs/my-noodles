import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { trackAddToCart, trackRemoveFromCart } from '@/shared/analytics';

const STORE_VERSION = 1;

export type CartLine = {
  productId: string;
  slug: string;
  title: string;
  priceMinor: number;
  currency: string;
  imageUrl?: string;
  qty: number;
};

type CartState = {
  items: CartLine[];
  panelOpen: boolean;
  panelOpenNonce: number;
  autoOpenSuppressed: boolean;
  addItem: (line: Omit<CartLine, 'qty'>, qty?: number) => void;
  removeItem: (productId: string) => void;
  setQuantity: (productId: string, qty: number) => void;
  clear: () => void;
  openPanel: () => void;
  closePanel: () => void;
  beginCheckout: () => void;
  totalMinor: () => number;
  itemCount: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      panelOpen: false,
      panelOpenNonce: 0,
      autoOpenSuppressed: false,
      addItem: (line, qty = 1) => {
        set((state) => {
          const existing = state.items.find((item) => item.productId === line.productId);
          const items = existing
            ? state.items.map((item) =>
                item.productId === line.productId ? { ...item, qty: item.qty + qty } : item,
              )
            : [...state.items, { ...line, qty }];

          return {
            items,
            panelOpen: state.autoOpenSuppressed ? state.panelOpen : true,
            panelOpenNonce:
              state.autoOpenSuppressed || state.panelOpen ? state.panelOpenNonce : state.panelOpenNonce + 1,
          };
        });
        trackAddToCart(line, qty);
      },
      removeItem: (productId) => {
        const item = get().items.find((entry) => entry.productId === productId);

        set((state) => ({ items: state.items.filter((entry) => entry.productId !== productId) }));

        if (item) {
          trackRemoveFromCart(item);
        }
      },
      setQuantity: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }

        const item = get().items.find((entry) => entry.productId === productId);

        if (item && qty < item.qty) {
          trackRemoveFromCart({ ...item, qty: item.qty - qty });
        } else if (item && qty > item.qty) {
          trackAddToCart(item, qty - item.qty);
        }

        set((state) => ({
          items: state.items.map((entry) => (entry.productId === productId ? { ...entry, qty } : entry)),
        }));
      },
      clear: () => set({ items: [] }),
      openPanel: () =>
        set((state) => ({
          panelOpen: true,
          panelOpenNonce: state.panelOpen ? state.panelOpenNonce : state.panelOpenNonce + 1,
        })),
      closePanel: () => set({ panelOpen: false, autoOpenSuppressed: true }),
      beginCheckout: () => set({ panelOpen: false, autoOpenSuppressed: false }),
      totalMinor: () => get().items.reduce((sum, item) => sum + item.priceMinor * item.qty, 0),
      itemCount: () => get().items.reduce((sum, item) => sum + item.qty, 0),
    }),
    {
      name: 'my-noodles-cart',
      storage: createJSONStorage(() => localStorage),
      version: STORE_VERSION,
      migrate: () => ({ items: [] }),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
