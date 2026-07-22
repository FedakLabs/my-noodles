import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { DEFAULT_LOCALE } from './locales';
import authUk from './messages/auth/uk.json';
import commonUk from './messages/common/uk.json';
import ordersUk from './messages/orders/uk.json';

function syncDocumentTitle(): void {
  document.title = i18n.t('common:appTitle');
}

void i18n.use(initReactI18next).init({
  resources: {
    uk: {
      common: commonUk,
      auth: authUk,
      orders: ordersUk,
    },
  },
  lng: DEFAULT_LOCALE,
  fallbackLng: DEFAULT_LOCALE,
  defaultNS: 'common',
  ns: ['common', 'auth', 'orders'],
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

syncDocumentTitle();
