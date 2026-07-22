import { createRootRoute, createRoute, Outlet, redirect } from '@tanstack/react-router';

import { AdminShell } from '@/components/layout/admin-shell';
import { getAccessToken } from '@/hooks/auth';
import { LoginScreen } from '@/screens/login';
import { OrderDetailScreen } from '@/screens/orders/order-detail-screen';
import { OrdersListScreen } from '@/screens/orders/orders-list-screen';

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
  component: () => <Outlet />,
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

export const orderDetailRoute = createRoute({
  getParentRoute: () => appLayoutRoute,
  path: ROUTE_NAMES.orderDetail,
  component: OrderDetailScreen,
});
