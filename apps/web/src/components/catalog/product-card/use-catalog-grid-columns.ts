import { useTheme } from '@mui/material/styles';
import { useSyncExternalStore } from 'react';

/** Matches ProductGrid `size={{ xs: 6, sm: 4, md: 4 }}`. */
export const CATALOG_PRODUCT_GRID_COLUMNS = { xs: 2, sm: 3 } as const;

export function getCatalogGridColumnsForWidth(width: number, smMin: number): number {
  return width >= smMin ? CATALOG_PRODUCT_GRID_COLUMNS.sm : CATALOG_PRODUCT_GRID_COLUMNS.xs;
}

/** Stable column count for DiscoveryCard preview anchors — avoids useMediaQuery SSR flash. */
export function useCatalogGridColumns(): number {
  const theme = useTheme();
  const smMin = theme.breakpoints.values.sm;

  return useSyncExternalStore(
    (onStoreChange) => {
      const mediaQuery = window.matchMedia(`(min-width: ${smMin}px)`);
      mediaQuery.addEventListener('change', onStoreChange);
      return () => mediaQuery.removeEventListener('change', onStoreChange);
    },
    () => getCatalogGridColumnsForWidth(window.innerWidth, smMin),
    () => CATALOG_PRODUCT_GRID_COLUMNS.sm,
  );
}
