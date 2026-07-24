import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { fontFamilies, layoutDisplay } from '@my-noodles/theme';
import { SelectField } from '@my-noodles/ui';
import CloseIcon from '@my-noodles/ui/icons/close.svg';
import MenuIcon from '@my-noodles/ui/icons/menu.svg';
import MynoodlesLogo from '@my-noodles/ui/icons/mynoodles-logo.svg';
import { Outlet, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/hooks/auth';
import { type AppLocale, DEFAULT_LOCALE, isLocale, LOCALE_OPTIONS } from '@/i18n/locales';
import { ROUTE_NAMES } from '@/router/route-names';

import { ADMIN_HEADER_HEIGHT } from './admin-nav-config';
import { AdminDesktopSidebar, AdminSidebar } from './admin-sidebar';

export function AdminShell() {
  const { t, i18n } = useTranslation('common');
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const navigate = useNavigate();
  const chromeLocale: AppLocale = isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;
  const [navOpen, setNavOpen] = useState(false);

  const closeNav = () => setNavOpen(false);

  return (
    <Box
      sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}
    >
      <AppBar
        position="sticky"
        color="inherit"
        elevation={0}
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Toolbar
          sx={{
            gap: 1,
            minHeight: ADMIN_HEADER_HEIGHT,
            height: ADMIN_HEADER_HEIGHT,
            py: 0,
          }}
        >
          <IconButton
            edge="start"
            color="inherit"
            aria-label={t('nav.menuOpen')}
            onClick={() => setNavOpen(true)}
            sx={{ display: layoutDisplay.mobileOnlyInlineFlex, mr: 0.5 }}
          >
            <MenuIcon aria-hidden size={24} />
          </IconButton>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0, flexGrow: 1 }}>
            <MynoodlesLogo aria-hidden style={{ width: 28, height: 28, flexShrink: 0 }} />
            <Typography
              variant="h6"
              component="span"
              sx={{
                fontFamily: fontFamilies.display,
                fontWeight: 700,
                letterSpacing: '-0.01em',
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {t('appTitle')}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
            <SelectField
              label={t('language')}
              size="small"
              width={100}
              value={chromeLocale}
              onChange={(event) => {
                const next = String(event.target.value);
                if (isLocale(next)) {
                  void i18n.changeLanguage(next);
                }
              }}
            >
              {LOCALE_OPTIONS.map((locale) => (
                <MenuItem key={locale.value} value={locale.value}>
                  {locale.value.toUpperCase()}
                </MenuItem>
              ))}
            </SelectField>
            <Button
              size="small"
              color="inherit"
              onClick={() => {
                clearTokens();
                void navigate({ to: ROUTE_NAMES.login });
              }}
            >
              {t('actions.logOut')}
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box sx={{ flex: '1 1 auto', minHeight: 0, display: 'flex' }}>
        <AdminDesktopSidebar />

        <Container maxWidth="lg" sx={{ py: 3, flex: '1 1 auto', minWidth: 0 }}>
          <Outlet />
        </Container>
      </Box>

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
              bgcolor: 'background.paper',
              color: 'text.primary',
              borderRight: 1,
              borderColor: 'divider',
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
            minHeight: ADMIN_HEADER_HEIGHT,
            height: ADMIN_HEADER_HEIGHT,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center', px: 0.5, minWidth: 0 }}>
            <MynoodlesLogo aria-hidden style={{ width: 28, height: 28, flexShrink: 0 }} />
            <Typography
              variant="subtitle1"
              component="span"
              sx={{
                fontFamily: fontFamilies.display,
                fontWeight: 700,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {t('appTitle')}
            </Typography>
          </Stack>
          <IconButton onClick={closeNav} aria-label={t('nav.menuClose')}>
            <CloseIcon aria-hidden size={24} />
          </IconButton>
        </Stack>
        <Divider />
        <AdminSidebar onNavigate={closeNav} />
      </Drawer>
    </Box>
  );
}
