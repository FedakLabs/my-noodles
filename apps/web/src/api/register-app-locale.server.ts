import 'server-only';

import { registerAppLocaleProvider } from '@my-noodles/api-clients/storefront';

import { registerQueryKeyLocaleProvider } from '@/shared/app-locale/resolve-query-key-locale';
import { getRequestAppLocale } from '@/shared/app-locale/server-context';

registerAppLocaleProvider(() => getRequestAppLocale());
registerQueryKeyLocaleProvider(() => getRequestAppLocale());
