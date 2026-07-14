import 'server-only';
import { registerQueryKeyLocaleProvider } from '@/i18n/app-locale/resolve-query-key-locale';
import { getRequestAppLocale } from '@/i18n/app-locale/server-context';

import { storefrontApi } from './clients';

storefrontApi.registerAppLocaleProvider(() => getRequestAppLocale());
registerQueryKeyLocaleProvider(() => getRequestAppLocale());
