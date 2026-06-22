export type Ga4Item = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
  item_brand?: string;
};

export type AnalyticsConsentChoice = 'pending' | 'granted' | 'denied';

export type PurchasePayload = {
  transactionId: string;
  valueMinor: number;
  currency: string;
  items: Ga4Item[];
};
