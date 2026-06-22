export { ANALYTICS_ENABLED, GA4_MEASUREMENT_ID } from './config';
export {
  CONSENT_DEFAULT_SCRIPT,
  CONSENT_STORAGE_KEY,
  isAnalyticsAllowed,
  readStoredConsent,
  updateConsentMode,
  writeStoredConsent,
} from './consent';
export { cartLineToGa4Item, priceMinorToMajor, productToGa4Item, sumItemsValueMinor } from './ecommerce';
export {
  trackAddToCart,
  trackBeginCheckout,
  trackClickTelegramOrder,
  trackPurchase,
  trackRemoveFromCart,
  trackViewItem,
  trackViewItemList,
} from './track';
export type { AnalyticsConsentChoice, Ga4Item, PurchasePayload } from './types';
