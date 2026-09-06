import { createFileRoute } from "@tanstack/react-router";

import NotFoundPage from "../components/layouts/NotFoundPage";
import { RouteError, RoutePending } from "../components/RouteStates";

export const Route = createFileRoute("/$")({
  component: NotFoundPage,
  errorComponent: RouteError,
  pendingComponent: RoutePending,
});
