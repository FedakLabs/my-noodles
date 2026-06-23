'use client';

import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';

import { useCatalogSearchParams } from '@/screens/catalog/search-params';

import { type CatalogViewMode, writeCatalogViewModeCookie } from './view-mode';

export type CatalogViewModeContextValue = {
  viewMode: CatalogViewMode;
  isInfiniteScroll: boolean;
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  setViewMode: (mode: CatalogViewMode) => void;
};

const CatalogViewModeContext = createContext<CatalogViewModeContextValue | null>(null);

type CatalogViewModeProviderProps = {
  initialViewMode: CatalogViewMode;
  hasViewModePreference: boolean;
  children: ReactNode;
};

export function CatalogViewModeProvider({
  initialViewMode,
  hasViewModePreference,
  children,
}: CatalogViewModeProviderProps) {
  const { params, setParams } = useCatalogSearchParams();
  const [viewMode, setViewModeState] = useState(initialViewMode);
  const [menuOpen, setMenuOpen] = useState(() => !hasViewModePreference);

  const setViewMode = useCallback(
    (nextViewMode: CatalogViewMode) => {
      writeCatalogViewModeCookie(nextViewMode);
      setViewModeState(nextViewMode);
      setMenuOpen(false);

      if (params.page !== 1) {
        void setParams({ page: 1 });
      }
    },
    [params.page, setParams],
  );

  const value = useMemo(
    (): CatalogViewModeContextValue => ({
      viewMode,
      isInfiniteScroll: viewMode === 'infinite',
      menuOpen,
      setMenuOpen,
      setViewMode,
    }),
    [viewMode, menuOpen, setViewMode],
  );

  return <CatalogViewModeContext.Provider value={value}>{children}</CatalogViewModeContext.Provider>;
}

export function useViewMode(): CatalogViewModeContextValue {
  const context = useContext(CatalogViewModeContext);

  if (context == null) {
    throw new Error('useViewMode must be used within CatalogViewModeProvider');
  }

  return context;
}
