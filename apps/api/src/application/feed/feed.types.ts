/** Active filter context captured per feed view (analytics) and accepted on `POST /feed/next`. */
export type FeedFilterSnapshot = {
  category?: string[];
  country?: string[];
  brand?: string[];
};
