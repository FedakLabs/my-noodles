import 'server-only';

import { registerAppLocaleProvider } from '@my-noodles/api-clients/storefront';

import { registerQueryKeyLocaleProvider } from '@/i18n/app-locale/resolve-query-key-locale';
import { getRequestAppLocale } from '@/i18n/app-locale/server-context';

registerAppLocaleProvider(() => getRequestAppLocale());
registerQueryKeyLocaleProvider(() => getRequestAppLocale());
