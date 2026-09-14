import { createRootRoute, Outlet } from "@tanstack/react-router";

import NotFoundPage from "../components/layouts/NotFoundPage";
import { RouteError, RoutePending } from "../components/RouteStates";

const RootLayout = () => (
  <>
    <Outlet />
  </>
);

export const Route = createRootRoute({
  component: RootLayout,
  errorComponent: RouteError,
  notFoundComponent: NotFoundPage,
  pendingComponent: RoutePending,
});
