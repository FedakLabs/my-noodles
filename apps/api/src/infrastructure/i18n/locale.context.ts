import { createContext } from '../context';
import { DEFAULT_LOCALE, type Locale } from './locale.config';

export const LocaleContext = createContext<Locale>('LOCALE', DEFAULT_LOCALE);
