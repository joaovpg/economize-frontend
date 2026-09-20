import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    redirect({
      throw: true,
      to: "/login",
    });
  },
  component: () => <Outlet />,
});
