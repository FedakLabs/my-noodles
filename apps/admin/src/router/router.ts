import { createRouter } from '@tanstack/react-router';

import {
  appLayoutRoute,
  brandsRoute,
  cartsRoute,
  categoriesRoute,
  collectionsRoute,
  countriesRoute,
  indexRoute,
  loginRoute,
  ordersRoute,
  productsRoute,
  rootRoute,
  sellersRoute,
} from './routes';

const routeTree = rootRoute.addChildren([
  loginRoute,
  appLayoutRoute.addChildren([
    indexRoute,
    ordersRoute,
    cartsRoute,
    productsRoute,
    brandsRoute,
    sellersRoute,
    categoriesRoute,
    collectionsRoute,
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
