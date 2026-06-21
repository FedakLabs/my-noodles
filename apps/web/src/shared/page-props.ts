export type LocaleParams = { locale: string };

export type LocalePageProps = {
  params: Promise<LocaleParams>;
};

export type LocaleSlugParams = LocaleParams & { slug: string };

export type LocaleSlugPageProps = {
  params: Promise<LocaleSlugParams>;
};
