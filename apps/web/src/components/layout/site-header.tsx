'use client';

import AppBar from '@mui/material/AppBar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import type { SxProps, Theme } from '@mui/material/styles';
import { useTheme } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { layoutDisplay } from '@my-noodles/theme';
import { iconStyle } from '@my-noodles/ui';
import CartIcon from '@my-noodles/ui/icons/cart.svg';
import ChevronRightIcon from '@my-noodles/ui/icons/chevron-right.svg';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import ContactsIcon from '@my-noodles/ui/icons/contacts.svg';
import HomeIcon from '@my-noodles/ui/icons/home.svg';
import MenuIcon from '@my-noodles/ui/icons/menu.svg';
import SearchIcon from '@my-noodles/ui/icons/search.svg';
import StarIcon from '@my-noodles/ui/icons/star.svg';
import { useTranslations } from 'next-intl';
import { type FC, Suspense, type SVGProps, useState } from 'react';

import { useCartActions, useCartItemCount } from '@/hooks/cart';
import { Link, usePathname } from '@/i18n/navigation';

import { LanguageSwitcher } from './language-switcher';
import { SiteLogo } from './site-logo';

type NavIcon = FC<SVGProps<SVGSVGElement>>;

type NavItem = {
  href: string;
  labelKey: 'nav.home' | 'nav.catalog' | 'nav.feed' | 'nav.contacts';
  Icon: NavIcon;
};

const navItems: NavItem[] = [
  { href: '/', labelKey: 'nav.home', Icon: HomeIcon },
  { href: '/catalog', labelKey: 'nav.catalog', Icon: SearchIcon },
  { href: '/feed', labelKey: 'nav.feed', Icon: StarIcon },
  { href: '/contacts', labelKey: 'nav.contacts', Icon: ContactsIcon },
];

function NavLink({
  href,
  label,
  active,
  icon: Icon,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  icon: NavIcon;
  onNavigate?: () => void;
}) {
  const theme = useTheme();
  const iconColor = active ? theme.palette.primary.main : theme.palette.text.primary;

  return (
    <Typography
      component={Link}
      href={href}
      variant="body2"
      onClick={onNavigate}
      sx={{
        px: 1.5,
        py: 0.75,
        borderRadius: 1,
        textDecoration: 'none',
        color: active ? 'primary.main' : 'text.primary',
        fontWeight: active ? 600 : 400,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
      }}
    >
      <Icon aria-hidden style={iconStyle({ size: 18, color: iconColor })} />
      {label}
    </Typography>
  );
}

function CartNavBadge({
  count,
  label,
  iconSize = 22,
  labelVariant = 'body2',
  sx,
}: {
  count: number;
  label: string;
  iconSize?: number;
  labelVariant?: 'body1' | 'body2';
  sx?: SxProps<Theme>;
}) {
  return (
    <Badge badgeContent={count} color="primary" invisible={count === 0} sx={sx}>
      <Stack
        component="span"
        direction="row"
        spacing={labelVariant === 'body1' ? 1.5 : 0.75}
        sx={{ alignItems: 'center', color: 'inherit' }}
      >
        <CartIcon aria-hidden style={iconStyle({ size: iconSize, color: 'inherit' })} />
        <Typography variant={labelVariant} component="span">
          {label}
        </Typography>
      </Stack>
    </Badge>
  );
}

export function SiteHeader() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const cartCount = useCartItemCount();
  const { openPanel } = useCartActions();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const closeMobileNav = () => setMobileNavOpen(false);

  const openCartPanel = () => {
    openPanel();
  };

  return (
    <>
      <AppBar position="sticky" color="inherit" elevation={0}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label={t('nav.menuOpen')}
            onClick={() => setMobileNavOpen(true)}
            sx={{ display: layoutDisplay.mobileOnlyInlineFlex, mr: 0.5 }}
          >
            <MenuIcon aria-hidden style={iconStyle({ size: 24, color: 'inherit' })} />
          </IconButton>

          <SiteLogo label={t('brand')} />

          <Stack direction="row" spacing={0.5} sx={{ display: layoutDisplay.desktopOnlyFlex }}>
            {navItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={t(item.labelKey)}
                active={pathname === item.href}
                icon={item.Icon}
              />
            ))}
          </Stack>

          <Stack direction="row" spacing={0} sx={{ alignItems: 'center', ml: 'auto' }}>
            <Button
              variant="text"
              color="inherit"
              onClick={openCartPanel}
              sx={{
                alignItems: 'center',
                display: 'inline-flex',
                minWidth: 'auto',
                px: { mobile: 1, desktop: 1.5 },
              }}
            >
              <CartNavBadge count={cartCount} label={t('nav.cart')} />
            </Button>

            <Stack
              direction="row"
              spacing={0}
              sx={{ display: layoutDisplay.desktopOnlyFlex, alignItems: 'center' }}
            >
              <Divider
                orientation="vertical"
                flexItem
                sx={{ alignSelf: 'center', height: 24, mx: 0.25, borderColor: 'divider' }}
              />

              <Suspense fallback={null}>
                <LanguageSwitcher />
              </Suspense>
            </Stack>
          </Stack>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileNavOpen}
        onClose={closeMobileNav}
        ModalProps={{ keepMounted: true }}
        sx={{ display: layoutDisplay.mobileOnlyBlock }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 1, py: 0.5 }}>
          <Box sx={{ px: 0.5 }}>
            <SiteLogo label={t('brand')} markSize={28} flexGrow={false} />
          </Box>
          <IconButton onClick={closeMobileNav} aria-label={t('nav.menuClose')}>
            <CloseIcon aria-hidden style={iconStyle({ size: 24, color: 'inherit' })} />
          </IconButton>
        </Stack>

        <List sx={{ minWidth: 280, pt: 0 }}>
          {navItems.map((item) => {
            const ItemIcon = item.Icon;

            return (
              <ListItemButton
                key={item.href}
                component={Link}
                href={item.href}
                selected={pathname === item.href}
                onClick={closeMobileNav}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <ItemIcon aria-hidden style={iconStyle({ size: 22, color: 'inherit' })} />
                </ListItemIcon>
                <ListItemText primary={t(item.labelKey)} />
                <ChevronRightIcon aria-hidden style={iconStyle({ size: 18, color: 'inherit' })} />
              </ListItemButton>
            );
          })}

          <Divider />

          <Suspense fallback={null}>
            <LanguageSwitcher variant="drawer" onSwitched={closeMobileNav} />
          </Suspense>
        </List>
      </Drawer>
    </>
  );
}
