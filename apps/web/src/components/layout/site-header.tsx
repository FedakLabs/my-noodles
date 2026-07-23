'use client';

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import MenuIcon from '@my-noodles/ui/icons/menu.svg';
import { useTranslations } from 'next-intl';
import { Suspense, useState } from 'react';

import { CartNavButton } from './cart-nav-button';
import { LanguageSwitcher } from './language-switcher';
import { SiteLogo } from './site-logo';
import { SITE_HEADER_HEIGHT } from './site-nav-config';
import { SiteNavPanel } from './site-nav-panel';

export function SiteHeader() {
  const t = useTranslations('common');
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = () => setNavOpen(false);

  return (
    <>
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar
          sx={(theme) => ({
            gap: 1,
            minHeight: SITE_HEADER_HEIGHT,
            height: SITE_HEADER_HEIGHT,
            py: 0,
            [theme.breakpoints.up('sm')]: {
              minHeight: SITE_HEADER_HEIGHT,
              height: SITE_HEADER_HEIGHT,
            },
          })}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label={t('nav.menuOpen')}
            onClick={() => setNavOpen(true)}
            sx={{ mr: 0.5 }}
          >
            <MenuIcon aria-hidden size={24} />
          </IconButton>

          <SiteLogo label={t('brand')} markSize={28} flexGrow />

          <CartNavButton label={t('nav.cart')} />
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={navOpen}
        onClose={closeNav}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: 'flex-start',
            },
          },
        }}
      >
        <Stack
          direction="row"
          sx={{
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            px: 1,
            py: 0,
            minHeight: SITE_HEADER_HEIGHT,
            height: SITE_HEADER_HEIGHT,
          }}
        >
          <Box sx={{ px: 0.5, minWidth: 0 }}>
            <SiteLogo label={t('brand')} markSize={28} flexGrow={false} onNavigate={closeNav} />
          </Box>
          <IconButton onClick={closeNav} aria-label={t('nav.menuClose')}>
            <CloseIcon aria-hidden size={24} />
          </IconButton>
        </Stack>

        <Box sx={{ flex: '0 0 auto', alignSelf: 'stretch' }}>
          <SiteNavPanel onNavigate={closeNav} />

          <Divider />

          <Suspense fallback={null}>
            <LanguageSwitcher onSwitched={closeNav} />
          </Suspense>
        </Box>
      </Drawer>
    </>
  );
}
