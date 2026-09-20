import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";

import NotFoundPage from "../components/layouts/NotFoundPage";
import { RouteError, RoutePending } from "../components/RouteStates";

import type { QueryClient } from "@tanstack/react-query";

export type RouterContext = {
  queryClient: QueryClient;
};

const RootLayout = () => (
  <>
    <Outlet />
  </>
);

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
  errorComponent: RouteError,
  notFoundComponent: NotFoundPage,
  pendingComponent: RoutePending,
});
