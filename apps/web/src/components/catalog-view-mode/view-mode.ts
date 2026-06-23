export const CATALOG_VIEW_MODE_COOKIE = 'my-noodles-catalog-view-mode';

export const DEFAULT_CATALOG_VIEW_MODE = 'infinite' as const;

export type CatalogViewMode = typeof DEFAULT_CATALOG_VIEW_MODE | 'pagination';

const CATALOG_VIEW_MODES: CatalogViewMode[] = ['infinite', 'pagination'];

export function isCatalogViewMode(value: string | undefined | null): value is CatalogViewMode {
  return value != null && (CATALOG_VIEW_MODES as string[]).includes(value);
}

export function parseCatalogViewMode(value: string | undefined | null): CatalogViewMode {
  return isCatalogViewMode(value) ? value : DEFAULT_CATALOG_VIEW_MODE;
}

export function hasCatalogViewModePreference(value: string | undefined | null): boolean {
  return isCatalogViewMode(value);
}

export function writeCatalogViewModeCookie(mode: CatalogViewMode): void {
  if (typeof document === 'undefined') {
    return;
  }

  const maxAgeSeconds = 60 * 60 * 24 * 365;
  document.cookie = `${CATALOG_VIEW_MODE_COOKIE}=${mode}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax`;
}
