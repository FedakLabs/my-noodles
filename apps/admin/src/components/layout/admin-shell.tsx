import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';

import { useAuthStore } from '@/hooks/auth';
import { ROUTE_NAMES } from '@/router/route-names';

export function AdminShell() {
  const { t } = useTranslation('common');
  const clearTokens = useAuthStore((state) => state.clearTokens);
  const navigate = useNavigate();

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
              <Typography variant="h6" component="span">
                {t('appTitle')}
              </Typography>
              <Button component={Link} to={ROUTE_NAMES.orders} size="small">
                {t('nav.orders')}
              </Button>
            </Stack>
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
        </Container>
      </Box>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Outlet />
      </Container>
    </Box>
  );
}
