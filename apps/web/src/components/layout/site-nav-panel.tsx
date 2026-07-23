'use client';

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChevronRightIcon from '@my-noodles/ui/icons/chevron-right.svg';
import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';

import { siteNavLinkItems } from './site-nav-config';

function isNavActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type SiteNavPanelProps = {
  onNavigate?: () => void;
};

export function SiteNavPanel({ onNavigate }: SiteNavPanelProps) {
  const t = useTranslations('common');
  const pathname = usePathname();

  return (
    <List sx={{ py: 0, minWidth: 280, flex: '0 0 auto' }}>
      {siteNavLinkItems.map((item) => {
        const ItemIcon = item.Icon;
        const active = isNavActive(pathname, item.href);

        return (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={active}
            onClick={onNavigate}
            sx={{
              flex: '0 0 auto',
              alignSelf: 'stretch',
              justifyContent: 'flex-start',
              px: 2,
              py: 1.5,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                justifyContent: 'center',
                color: active ? 'primary.main' : 'text.primary',
              }}
            >
              <ItemIcon aria-hidden size={22} />
            </ListItemIcon>
            <ListItemText primary={t(item.labelKey)} />
            <ChevronRightIcon aria-hidden size={18} />
          </ListItemButton>
        );
      })}
    </List>
  );
}
