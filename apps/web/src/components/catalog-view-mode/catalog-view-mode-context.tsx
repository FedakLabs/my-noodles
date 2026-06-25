'use client';

import { useQueryClient } from '@tanstack/react-query';
import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { removeCatalogProductsListQueries } from '@/api/products';
import { useCatalogSearchParams } from '@/screens/catalog/search-params';
import { trackCatalogBrowseMode } from '@/shared/analytics';

import { type CatalogViewMode, writeCatalogViewModeCookie } from './view-mode';

export type CatalogViewModeContextValue = {
  viewMode: CatalogViewMode;
  isInfiniteScroll: boolean;
  isViewModeResetting: boolean;
  clearViewModeReset: () => void;
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
  const queryClient = useQueryClient();
  const { params, setParams } = useCatalogSearchParams();
  const [viewMode, setViewModeState] = useState(initialViewMode);
  const [isViewModeResetting, setIsViewModeResetting] = useState(false);
  const [menuOpen, setMenuOpen] = useState(() => !hasViewModePreference);

  useEffect(() => {
    trackCatalogBrowseMode(initialViewMode, hasViewModePreference ? 'saved' : 'default');
  }, [initialViewMode, hasViewModePreference]);

  const clearViewModeReset = useCallback(() => {
    setIsViewModeResetting(false);
  }, []);

  const setViewMode = useCallback(
    (nextViewMode: CatalogViewMode) => {
      if (nextViewMode === viewMode) {
        setMenuOpen(false);
        return;
      }

      writeCatalogViewModeCookie(nextViewMode);
      removeCatalogProductsListQueries(queryClient);
      setIsViewModeResetting(true);
      setViewModeState(nextViewMode);
      setMenuOpen(false);
      trackCatalogBrowseMode(nextViewMode, 'menu');

      if (params.page !== 1) {
        void setParams({ page: 1 });
      }
    },
    [params, queryClient, setParams, viewMode],
  );

  const value = useMemo(
    (): CatalogViewModeContextValue => ({
      viewMode,
      isInfiniteScroll: viewMode === 'infinite',
      isViewModeResetting,
      clearViewModeReset,
      menuOpen,
      setMenuOpen,
      setViewMode,
    }),
    [viewMode, isViewModeResetting, clearViewModeReset, menuOpen, setViewMode],
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
