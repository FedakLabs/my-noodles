import CartIcon from '@my-noodles/ui/icons/cart.svg';
import CatalogIcon from '@my-noodles/ui/icons/catalog.svg';
import ChatIcon from '@my-noodles/ui/icons/chat.svg';
import CollectionsIcon from '@my-noodles/ui/icons/collections.svg';
import ExternalLinkIcon from '@my-noodles/ui/icons/external-link.svg';
import FilterIcon from '@my-noodles/ui/icons/filter.svg';
import GlobeIcon from '@my-noodles/ui/icons/globe.svg';
import StarIcon from '@my-noodles/ui/icons/star.svg';
import type { SvgIconProps } from '@my-noodles/ui/types';
import type { FC } from 'react';

import { ROUTE_NAMES } from '@/router/route-names';
import { SUPPORT_DASHBOARD_URL } from '@/shared/urls';

export const ADMIN_SIDEBAR_WIDTH = 280;
export const ADMIN_HEADER_HEIGHT = 56;

type AdminNavLabelKey =
  | 'nav.orders'
  | 'nav.carts'
  | 'nav.products'
  | 'nav.brands'
  | 'nav.sellers'
  | 'nav.categories'
  | 'nav.collections'
  | 'nav.countries'
  | 'nav.support';

type AdminNavIcon = FC<SvgIconProps>;

type AdminNavRouteItem = {
  kind: 'route';
  to: string;
  labelKey: AdminNavLabelKey;
  Icon: AdminNavIcon;
};

type AdminNavExternalItem = {
  kind: 'external';
  href: string;
  labelKey: AdminNavLabelKey;
  Icon: AdminNavIcon;
  TrailingIcon: AdminNavIcon;
};

type AdminNavItem = AdminNavRouteItem | AdminNavExternalItem;

export const adminNavItems: AdminNavItem[] = [
  { kind: 'route', to: ROUTE_NAMES.orders, labelKey: 'nav.orders', Icon: CollectionsIcon },
  { kind: 'route', to: ROUTE_NAMES.carts, labelKey: 'nav.carts', Icon: CartIcon },
  { kind: 'route', to: ROUTE_NAMES.products, labelKey: 'nav.products', Icon: CatalogIcon },
  { kind: 'route', to: ROUTE_NAMES.brands, labelKey: 'nav.brands', Icon: StarIcon },
  { kind: 'route', to: ROUTE_NAMES.sellers, labelKey: 'nav.sellers', Icon: CollectionsIcon },
  { kind: 'route', to: ROUTE_NAMES.categories, labelKey: 'nav.categories', Icon: FilterIcon },
  { kind: 'route', to: ROUTE_NAMES.collections, labelKey: 'nav.collections', Icon: CollectionsIcon },
  { kind: 'route', to: ROUTE_NAMES.countries, labelKey: 'nav.countries', Icon: GlobeIcon },
  {
    kind: 'external',
    href: SUPPORT_DASHBOARD_URL,
    labelKey: 'nav.support',
    Icon: ChatIcon,
    TrailingIcon: ExternalLinkIcon,
  },
];

export function isAdminNavActive(pathname: string, to: string): boolean {
  return pathname === to || pathname.startsWith(`${to}/`);
}
