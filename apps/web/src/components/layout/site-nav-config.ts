import CatalogIcon from '@my-noodles/ui/icons/catalog.svg';
import CollectionsIcon from '@my-noodles/ui/icons/collections.svg';
import ContactsIcon from '@my-noodles/ui/icons/contacts.svg';
import HomeIcon from '@my-noodles/ui/icons/home.svg';
import SearchIcon from '@my-noodles/ui/icons/search.svg';
import type { FC, SVGProps } from 'react';

import { isFeedRoute } from '@/shared/routes';

export type SiteNavLabelKey = 'nav.home' | 'nav.catalog' | 'nav.collections' | 'nav.feed' | 'nav.contacts';

export type SiteNavIcon = FC<SVGProps<SVGSVGElement>>;

export type SiteNavLinkItem = {
  kind: 'link';
  href: string;
  labelKey: SiteNavLabelKey;
  Icon: SiteNavIcon;
};

export const siteNavLinkItems: SiteNavLinkItem[] = [
  { kind: 'link', href: '/', labelKey: 'nav.home', Icon: HomeIcon },
  { kind: 'link', href: '/catalog', labelKey: 'nav.catalog', Icon: CatalogIcon },
  { kind: 'link', href: '/collections', labelKey: 'nav.collections', Icon: CollectionsIcon },
  { kind: 'link', href: '/feed', labelKey: 'nav.feed', Icon: SearchIcon },
  { kind: 'link', href: '/contacts', labelKey: 'nav.contacts', Icon: ContactsIcon },
];

/** Sticky app header height (px) — keep in sync with `SiteHeader` toolbar and nav overlay offsets. */
export const SITE_HEADER_HEIGHT = 56;

export function isImmersiveRoute(pathname: string): boolean {
  return isFeedRoute(pathname);
}
