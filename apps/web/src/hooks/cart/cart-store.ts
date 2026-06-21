import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

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
      },
      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((item) => item.productId !== productId) }));
      },
      setQuantity: (productId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) => (item.productId === productId ? { ...item, qty } : item)),
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
