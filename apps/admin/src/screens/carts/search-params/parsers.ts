import { parseAsString } from 'nuqs';

export const CART_SEARCH_FIELDS = ['visitorSessionId'] as const;

export type CartSearchField = (typeof CART_SEARCH_FIELDS)[number];

export const cartsSearchParamsParsers = {
  visitorSessionId: parseAsString,
};
