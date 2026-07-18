import 'server-only';
import type { Metadata } from 'next';
import { hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { ReactNode } from 'react';

import type { AppLocale } from '@/i18n/routing';
import { routing } from '@/i18n/routing';

import { runWithAppLocale } from './server-context';

type LocaleParams = { locale: string };

type LocalePageProps = {
  params: Promise<LocaleParams>;
};

export type ResolvedPageParams<TParams extends LocaleParams> = Omit<TParams, 'locale'> & {
  locale: AppLocale;
};

export type WithPageLocaleProps<TProps extends LocalePageProps> = Omit<TProps, 'params'> & {
  params: ResolvedPageParams<Awaited<TProps['params']>>;
  locale: AppLocale;
};

async function resolvePageLocaleProps<TProps extends LocalePageProps>(
  props: TProps,
): Promise<WithPageLocaleProps<TProps> | null> {
  const resolved = await props.params;
  const { locale } = resolved;

  if (!hasLocale(routing.locales, locale)) {
    return null;
  }

  setRequestLocale(locale);

  const { params: _params, ...rest } = props;

  return {
    ...rest,
    params: { ...resolved, locale },
    locale,
  } as WithPageLocaleProps<TProps>;
}

export function withPageLocaleResult<TProps extends LocalePageProps, TResult>(
  onValid: (props: WithPageLocaleProps<TProps>) => TResult | Promise<TResult>,
  onInvalid: (params: Awaited<TProps['params']>) => TResult | Promise<TResult>,
): (props: TProps) => Promise<TResult> {
  return async function PageLocaleResult(props: TProps) {
    const localizedProps = await resolvePageLocaleProps(props);

    if (!localizedProps) {
      return onInvalid((await props.params) as Awaited<TProps['params']>);
    }

    return runWithAppLocale(localizedProps.locale, () => onValid(localizedProps));
  };
}

export function withPageLocale<TProps extends LocalePageProps>(
  Page: (props: WithPageLocaleProps<TProps>) => ReactNode | Promise<ReactNode>,
): (props: TProps) => Promise<ReactNode> {
  return withPageLocaleResult(Page, () => notFound());
}

export function withPageLocaleMetadata<TProps extends LocalePageProps>(
  generate: (props: WithPageLocaleProps<TProps>) => Metadata | Promise<Metadata>,
): (props: TProps) => Promise<Metadata> {
  return withPageLocaleResult(generate, () => ({}));
}
