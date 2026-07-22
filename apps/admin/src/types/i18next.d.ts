import 'i18next';
import type auth from '../i18n/messages/auth/uk.json';
import type common from '../i18n/messages/common/uk.json';
import type orders from '../i18n/messages/orders/uk.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      auth: typeof auth;
      orders: typeof orders;
    };
  }
}
