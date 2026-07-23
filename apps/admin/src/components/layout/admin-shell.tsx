import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { fontFamilies } from '@my-noodles/theme';
import { SelectField } from '@my-noodles/ui';
import MynoodlesLogo from '@my-noodles/ui/icons/mynoodles-logo.svg';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/hooks/auth';
import { type AppLocale, DEFAULT_LOCALE, isLocale, LOCALE_OPTIONS } from '@/i18n/locales';
import { ROUTE_NAMES } from '@/router/route-names';

export function AdminShell() {
  const { t, i18n } = useTranslation('common');
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const navigate = useNavigate();
  const chromeLocale: AppLocale = isLocale(i18n.language) ? i18n.language : DEFAULT_LOCALE;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        component="header"
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          py: 1.5,
          px: 2,
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', minWidth: 0 }}>
                <MynoodlesLogo aria-hidden style={{ width: 28, height: 28, flexShrink: 0 }} />
                <Typography
                  variant="h6"
                  component="span"
                  sx={{
                    fontFamily: fontFamilies.display,
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    minWidth: 0,
                  }}
                >
                  {t('appTitle')}
                </Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button component={Link} to={ROUTE_NAMES.orders} size="small">
                  {t('nav.orders')}
                </Button>
                <Button component={Link} to={ROUTE_NAMES.products} size="small">
                  {t('nav.products')}
                </Button>
                <Button component={Link} to={ROUTE_NAMES.brands} size="small">
                  {t('nav.brands')}
                </Button>
                <Button component={Link} to={ROUTE_NAMES.categories} size="small">
                  {t('nav.categories')}
                </Button>
                <Button component={Link} to={ROUTE_NAMES.countries} size="small">
                  {t('nav.countries')}
                </Button>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
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
          </Stack>
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
