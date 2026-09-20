import { createFileRoute } from "@tanstack/react-router";

import { ComingSoonPage } from "../../components/layouts/ComingSoonPage";

export const Route = createFileRoute("/_private/profile")({
  component: ProfileRoute,
  loader: async () => ({
    description: "As configurações da sua conta estarão disponíveis em breve.",
    title: "Perfil",
  }),
});

function ProfileRoute() {
  const { description, title } = Route.useLoaderData();

  return <ComingSoonPage description={description} title={title} />;
}
