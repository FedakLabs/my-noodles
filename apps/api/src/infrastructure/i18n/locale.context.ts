import { createContext } from '@my-noodles/api-lib/context';

import { DEFAULT_LOCALE, type Locale } from './locale.config';

export const LocaleContext = createContext<Locale>('LOCALE', DEFAULT_LOCALE);
