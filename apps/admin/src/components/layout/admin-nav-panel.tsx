import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChevronRightIcon from '@my-noodles/ui/icons/chevron-right.svg';
import { Link, useRouterState } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { adminNavItems, isAdminNavActive } from './admin-nav-config';

type AdminNavPanelProps = {
  onNavigate?: () => void;
};

export function AdminNavPanel({ onNavigate }: AdminNavPanelProps) {
  const { t } = useTranslation('common');
  const pathname = useRouterState({ select: (state) => state.location.pathname });

  return (
    <List sx={{ py: 0, minWidth: 280, flex: '0 0 auto' }}>
      {adminNavItems.map((item) => {
        const ItemIcon = item.Icon;

        if (item.kind === 'external') {
          const TrailingIcon = item.TrailingIcon;
          return (
            <ListItemButton
              key={item.href}
              component="a"
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              sx={{
                flex: '0 0 auto',
                alignSelf: 'stretch',
                justifyContent: 'flex-start',
                px: 2,
                py: 1.5,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, justifyContent: 'center', color: 'text.primary' }}>
                <ItemIcon aria-hidden size={22} />
              </ListItemIcon>
              <ListItemText primary={t(item.labelKey)} />
              <TrailingIcon aria-hidden size={18} />
            </ListItemButton>
          );
        }

        const active = isAdminNavActive(pathname, item.to);

        return (
          <ListItemButton
            key={item.to}
            component={Link}
            to={item.to}
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
