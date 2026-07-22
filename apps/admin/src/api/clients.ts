import { AdminApi } from '@my-noodles/api-clients/admin';

import { getAccessToken, getRefreshToken, useAuthStore } from '@/hooks/auth';
import { ROUTE_NAMES } from '@/router/route-names';
import { env } from '@/shared/env';

export const adminApi = new AdminApi({
  baseUrl: env.ADMIN_API_URL,
});

adminApi.registerTokenProvider({
  getAccessToken,
  getRefreshToken,
  setTokens: (tokens) => useAuthStore.getState().setTokens(tokens),
  clearTokens: () => useAuthStore.getState().clearTokens(),
});

adminApi.registerAuthHandlers({
  onUnauthorized: () => {
    if (window.location.pathname !== ROUTE_NAMES.login) {
      window.location.assign(ROUTE_NAMES.login);
    }
  },
});
