export type LocaleParams = { locale: string };

export type PageSearchParams = Record<string, string | string[] | undefined>;

/**
 * Props for a `[locale]` route. Extend with extra dynamic segments and/or search params:
 * - `LocalePageProps` → just `[locale]`
 * - `LocalePageProps<{ slug: string }>` → `[locale]/[slug]`
 * - `LocalePageProps<object, PageSearchParams>` → `[locale]` with `?query`
 */
export type LocalePageProps<TParams = object, TSearchParams = never> = {
  params: Promise<LocaleParams & TParams>;
} & ([TSearchParams] extends [never] ? object : { searchParams: Promise<TSearchParams> });
