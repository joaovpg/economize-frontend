import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

import NotFoundPage from "../components/layouts/NotFoundPage";
import { RouteError, RoutePending } from "../components/RouteStates";

export const Route = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
  errorComponent: RouteError,
  notFoundComponent: NotFoundPage,
  pendingComponent: RoutePending,
});
