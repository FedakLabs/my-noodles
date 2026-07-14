'use client';

import { useLocaleStore } from '@/hooks/locale';
import { registerQueryKeyLocaleProvider } from '@/i18n/app-locale/resolve-query-key-locale';

import { storefrontApi } from './clients';

const resolveClientAppLocale = () => useLocaleStore.getState().locale;

storefrontApi.registerAppLocaleProvider(resolveClientAppLocale);
registerQueryKeyLocaleProvider(resolveClientAppLocale);
