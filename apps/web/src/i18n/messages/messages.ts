import type { AppLocale } from '../routing';
import analyticsEn from './analytics/en.json';
import analyticsUk from './analytics/uk.json';
import cartEn from './cart/en.json';
import cartUk from './cart/uk.json';
import catalogEn from './catalog/en.json';
import catalogUk from './catalog/uk.json';
import checkoutEn from './checkout/en.json';
import checkoutUk from './checkout/uk.json';
import collectionsEn from './collections/en.json';
import collectionsUk from './collections/uk.json';
import commonEn from './common/en.json';
import commonUk from './common/uk.json';
import contactsEn from './contacts/en.json';
import contactsUk from './contacts/uk.json';
import feedEn from './feed/en.json';
import feedUk from './feed/uk.json';
import homeEn from './home/en.json';
import homeUk from './home/uk.json';
import metadataEn from './metadata/en.json';
import metadataUk from './metadata/uk.json';
import notFoundEn from './notFound/en.json';
import notFoundUk from './notFound/uk.json';
import orderEn from './order/en.json';
import orderUk from './order/uk.json';
import productEn from './product/en.json';
import productUk from './product/uk.json';

export const ukMessages = {
  analytics: analyticsUk,
  cart: cartUk,
  catalog: catalogUk,
  checkout: checkoutUk,
  collections: collectionsUk,
  common: commonUk,
  contacts: contactsUk,
  feed: feedUk,
  home: homeUk,
  metadata: metadataUk,
  notFound: notFoundUk,
  order: orderUk,
  product: productUk,
} as const;

export type Messages = typeof ukMessages;

export const enMessages = {
  analytics: analyticsEn,
  cart: cartEn,
  catalog: catalogEn,
  checkout: checkoutEn,
  collections: collectionsEn,
  common: commonEn,
  contacts: contactsEn,
  feed: feedEn,
  home: homeEn,
  metadata: metadataEn,
  notFound: notFoundEn,
  order: orderEn,
  product: productEn,
} satisfies Messages;

export type MessageNamespace = keyof Messages;

export const messageNamespaces = Object.keys(ukMessages) as MessageNamespace[];

export const messageCatalogs = {
  uk: ukMessages,
  en: enMessages,
} as const satisfies Record<AppLocale, Messages>;
