import type { AppLocale } from '@/i18n/routing';

type LocaleRouter = {
  replace: (href: string, options: { locale: AppLocale }) => void;
};

export function buildLocalizedHref(pathname: string, searchParams: URLSearchParams): string {
  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}

export function switchAppLocale(
  next: AppLocale,
  current: AppLocale,
  pathname: string,
  searchParams: URLSearchParams,
  router: LocaleRouter,
  setLocale: (locale: AppLocale) => void,
): void {
  if (next === current) {
    return;
  }

  setLocale(next);
  router.replace(buildLocalizedHref(pathname, searchParams), { locale: next });
}
