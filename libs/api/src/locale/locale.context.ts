import { DEFAULT_LOCALE, type Locale } from '@my-noodles/locale';

import { createContext } from '../context/index';

export const LocaleContext = createContext<Locale>('LOCALE', DEFAULT_LOCALE);
