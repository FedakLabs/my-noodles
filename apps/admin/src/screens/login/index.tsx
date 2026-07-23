import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { authControllerLogin } from '@my-noodles/api-clients/auth';
import { useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { authApi } from '@/api/clients';
import { useAuthStore } from '@/hooks/auth';
import { ROUTE_NAMES } from '@/router/route-names';

export function LoginScreen() {
  const { t } = useTranslation('auth');
  const setTokens = useAuthStore((state) => state.setTokens);
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const result = await authControllerLogin({
        body: { email, password },
        client: authApi.apiClient,
      });
      setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      await navigate({ to: ROUTE_NAMES.orders });
    } catch {
      setError(t('errors.invalidCredentials'));
    } finally {
      setPending(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        px: 2,
        bgcolor: 'background.default',
      }}
    >
      <Box
        component="form"
        onSubmit={(event) => {
          void onSubmit(event);
        }}
        sx={{ width: '100%', maxWidth: 400 }}
      >
        <Stack spacing={2}>
          <Typography variant="h4" component="h1">
            {t('title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('subtitle')}
          </Typography>
          {error ? <Alert severity="error">{error}</Alert> : null}
          <TextField
            label={t('email')}
            type="email"
            autoComplete="username"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            fullWidth
          />
          <TextField
            label={t('password')}
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            fullWidth
          />
          <Button type="submit" variant="contained" disabled={pending} fullWidth>
            {pending ? t('signingIn') : t('signIn')}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}
