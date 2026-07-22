import { createRouter } from '@tanstack/react-router';

import { appLayoutRoute, indexRoute, loginRoute, orderDetailRoute, ordersRoute, rootRoute } from './routes';

const routeTree = rootRoute.addChildren([
  loginRoute,
  appLayoutRoute.addChildren([indexRoute, ordersRoute, orderDetailRoute]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
