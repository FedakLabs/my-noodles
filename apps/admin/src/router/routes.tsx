import { createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router';

import { AdminShell } from '@/components/layout/admin-shell';
import { getAccessToken } from '@/hooks/auth';
import { BrandsListScreen } from '@/screens/brands/brands-list-screen';
import { CategoriesListScreen } from '@/screens/categories/categories-list-screen';
import { CountriesListScreen } from '@/screens/countries/countries-list-screen';
import { LoginScreen } from '@/screens/login';
import { OrdersListScreen } from '@/screens/orders/orders-list-screen';
import { ProductsListScreen } from '@/screens/products/products-list-screen';

import { ROUTE_NAMES } from './route-names';

function requireAuth(): void {
  if (!getAccessToken()) {
    throw redirect({ to: ROUTE_NAMES.login });
  }
}

function redirectIfAuthed(): void {
  if (getAccessToken()) {
    throw redirect({ to: ROUTE_NAMES.orders });
  }
}

export const rootRoute = createRootRoute({
  component: () => (
    <NuqsAdapter>
      <Outlet />
    </NuqsAdapter>
  ),
});

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: ROUTE_NAMES.login,
  beforeLoad: () => {
    redirectIfAuthed();
  },
  component: LoginScreen,
});

export const appLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'app-layout',
  beforeLoad: () => {
    requireAuth();
  },
  component: AdminShell,
});

export const indexRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: '/',
  beforeLoad: () => {
    throw redirect({ to: ROUTE_NAMES.orders });
  },
});

export const ordersRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: ROUTE_NAMES.orders,
  component: OrdersListScreen,
});

export const productsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: ROUTE_NAMES.products,
  component: ProductsListScreen,
});

export const brandsRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: ROUTE_NAMES.brands,
  component: BrandsListScreen,
});

export const categoriesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: ROUTE_NAMES.categories,
  component: CategoriesListScreen,
});

export const countriesRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: ROUTE_NAMES.countries,
  component: CountriesListScreen,
});
