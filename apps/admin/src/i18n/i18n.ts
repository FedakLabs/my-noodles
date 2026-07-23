import { discoveryCardMessages, type Locale } from '@my-noodles/locale';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { ADMIN_CHROME_LOCALE_STORAGE_KEY, DEFAULT_LOCALE, isLocale, SUPPORTED_LOCALES } from './locales';
import authEn from './messages/auth/en.json';
import authUk from './messages/auth/uk.json';
import brandsEn from './messages/brands/en.json';
import brandsUk from './messages/brands/uk.json';
import categoriesEn from './messages/categories/en.json';
import categoriesUk from './messages/categories/uk.json';
import commonEn from './messages/common/en.json';
import commonUk from './messages/common/uk.json';
import countriesEn from './messages/countries/en.json';
import countriesUk from './messages/countries/uk.json';
import ordersEn from './messages/orders/en.json';
import ordersUk from './messages/orders/uk.json';
import productsEn from './messages/products/en.json';
import productsUk from './messages/products/uk.json';

type AdminNamespaceResources = {
  common: typeof commonUk;
  auth: typeof authUk;
  orders: typeof ordersUk;
  products: typeof productsUk;
  brands: typeof brandsUk;
  categories: typeof categoriesUk;
  countries: typeof countriesUk;
  discoveryCard: (typeof discoveryCardMessages)['uk'];
};

const resources = {
  uk: {
    common: commonUk,
    auth: authUk,
    orders: ordersUk,
    products: productsUk,
    brands: brandsUk,
    categories: categoriesUk,
    countries: countriesUk,
    discoveryCard: discoveryCardMessages.uk,
  },
  en: {
    common: commonEn,
    auth: authEn,
    orders: ordersEn,
    products: productsEn,
    brands: brandsEn,
    categories: categoriesEn,
    countries: countriesEn,
    discoveryCard: discoveryCardMessages.en,
  },
} as const satisfies Record<Locale, AdminNamespaceResources>;

function readStoredChromeLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const stored = window.localStorage.getItem(ADMIN_CHROME_LOCALE_STORAGE_KEY);
  return stored && isLocale(stored) ? stored : DEFAULT_LOCALE;
}

function syncDocumentTitle(): void {
  document.title = i18n.t('common:appTitle');
}

void i18n.use(initReactI18next).init({
  resources,
  lng: readStoredChromeLocale(),
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: [...SUPPORTED_LOCALES],
  defaultNS: 'common',
  ns: ['common', 'auth', 'orders', 'products', 'brands', 'categories', 'countries', 'discoveryCard'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

syncDocumentTitle();

i18n.on('languageChanged', (lng) => {
  if (isLocale(lng) && typeof window !== 'undefined') {
    window.localStorage.setItem(ADMIN_CHROME_LOCALE_STORAGE_KEY, lng);
  }
  syncDocumentTitle();
});
