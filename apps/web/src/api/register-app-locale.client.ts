'use client';

import { registerAppLocaleProvider } from '@my-noodles/api-clients/storefront';

import { useLocaleStore } from '@/hooks/locale';
import { registerQueryKeyLocaleProvider } from '@/shared/app-locale/resolve-query-key-locale';

const resolveClientAppLocale = () => useLocaleStore.getState().locale;

registerAppLocaleProvider(resolveClientAppLocale);
registerQueryKeyLocaleProvider(resolveClientAppLocale);
