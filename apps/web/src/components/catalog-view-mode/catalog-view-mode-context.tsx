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
  /** Intro flow — menu stays open until the customer picks a browse style. */
  requiresExplicitSelection: boolean;
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
  const [menuOpen, setMenuOpenState] = useState(() => !hasViewModePreference);
  const [hasSavedPreference, setHasSavedPreference] = useState(hasViewModePreference);

  useEffect(() => {
    trackCatalogBrowseMode(initialViewMode, hasViewModePreference ? 'saved' : 'default');
  }, [initialViewMode, hasViewModePreference]);

  const clearViewModeReset = useCallback(() => {
    setIsViewModeResetting(false);
  }, []);

  const persistViewModePreference = useCallback((mode: CatalogViewMode) => {
    writeCatalogViewModeCookie(mode);
    setHasSavedPreference(true);
  }, []);

  const setMenuOpen = useCallback((open: boolean) => {
    setMenuOpenState(open);
  }, []);

  const setViewMode = useCallback(
    (nextViewMode: CatalogViewMode) => {
      persistViewModePreference(nextViewMode);
      setMenuOpen(false);

      if (nextViewMode === viewMode) {
        return;
      }

      removeCatalogProductsListQueries(queryClient);
      setIsViewModeResetting(true);
      setViewModeState(nextViewMode);
      trackCatalogBrowseMode(nextViewMode, 'menu');

      if (params.page !== 1) {
        void setParams({ page: 1 });
      }
    },
    [params, persistViewModePreference, queryClient, setMenuOpen, setParams, viewMode],
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
      requiresExplicitSelection: !hasSavedPreference,
    }),
    [
      viewMode,
      isViewModeResetting,
      clearViewModeReset,
      menuOpen,
      setMenuOpen,
      setViewMode,
      hasSavedPreference,
    ],
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
