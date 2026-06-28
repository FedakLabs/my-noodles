import { SwaggerAppLocaleHeader } from '@/utils/swagger';

/** Storefront controllers that document optional `x-app-locale` for localized responses. */
@SwaggerAppLocaleHeader()
export abstract class LocalizedStorefrontController {}
