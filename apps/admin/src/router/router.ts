import { createRouter } from '@tanstack/react-router';

import {
  appLayoutRoute,
  brandsRoute,
  categoriesRoute,
  countriesRoute,
  indexRoute,
  loginRoute,
  ordersRoute,
  productDetailRoute,
  productsRoute,
  rootRoute,
} from './routes';

const routeTree = rootRoute.addChildren([
  loginRoute,
  appLayoutRoute.addChildren([
    indexRoute,
    ordersRoute,
    productsRoute,
    productDetailRoute,
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
