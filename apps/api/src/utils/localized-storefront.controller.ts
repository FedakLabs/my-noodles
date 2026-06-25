import { AppLocaleHeader } from './app-locale-header.decorator';

/** Storefront controllers that document optional `x-app-locale` for localized responses. */
@AppLocaleHeader()
export abstract class LocalizedStorefrontController {}
