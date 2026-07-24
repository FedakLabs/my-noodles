import type { DiscoveryCardMessages } from '@my-noodles/locale';
import 'i18next';

import type auth from '../i18n/messages/auth/uk.json';
import type brands from '../i18n/messages/brands/uk.json';
import type carts from '../i18n/messages/carts/uk.json';
import type categories from '../i18n/messages/categories/uk.json';
import type collections from '../i18n/messages/collections/uk.json';
import type common from '../i18n/messages/common/uk.json';
import type countries from '../i18n/messages/countries/uk.json';
import type orders from '../i18n/messages/orders/uk.json';
import type products from '../i18n/messages/products/uk.json';
import type sellers from '../i18n/messages/sellers/uk.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      auth: typeof auth;
      orders: typeof orders;
      carts: typeof carts;
      products: typeof products;
      brands: typeof brands;
      sellers: typeof sellers;
      categories: typeof categories;
      collections: typeof collections;
      countries: typeof countries;
      discoveryCard: DiscoveryCardMessages;
    };
  }
}
