import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_private/dashboard")({
  beforeLoad: () => {
    throw redirect({ replace: true, to: "/summary" });
  },
});
