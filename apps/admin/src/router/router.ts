import { createRouter } from '@tanstack/react-router';

import {
  appLayoutRoute,
  brandsRoute,
  cartsRoute,
  categoriesRoute,
  countriesRoute,
  indexRoute,
  loginRoute,
  ordersRoute,
  productsRoute,
  rootRoute,
} from './routes';

const routeTree = rootRoute.addChildren([
  loginRoute,
  appLayoutRoute.addChildren([
    indexRoute,
    ordersRoute,
    cartsRoute,
    productsRoute,
    brandsRoute,
    categoriesRoute,
    countriesRoute,
  ]),
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
