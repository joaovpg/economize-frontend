import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { createFileRoute } from "@tanstack/react-router";

import { Link } from "../../components/Link";
import { RouteError, RoutePending } from "../../components/RouteStates";

export const Route = createFileRoute("/_private/profile")({
  component: ProfileRoute,
  errorComponent: RouteError,
  loader: async () => ({
    description: "As configurações da sua conta estarão disponíveis em breve.",
    title: "Perfil",
  }),
  pendingComponent: RoutePending,
});

function ProfileRoute() {
  const { description, title } = Route.useLoaderData();

  return <ComingSoonPage description={description} title={title} />;
}

type ComingSoonPageProps = {
  description: string;
  title: string;
};

function ComingSoonPage({ description, title }: ComingSoonPageProps) {
  return (
    <main className="grid max-w-152 gap-3.5 px-7 py-16" aria-labelledby="placeholder-title">
      <h1 className="m-0 text-page-title" id="placeholder-title">
        {title}
      </h1>
      <p className="m-0 text-body text-muted">{description}</p>
      <p className="m-0 text-body-small text-subtle">Esta área está sendo preparada.</p>
      <Link to="/summary" variant="secondary" leadingIcon={<ArrowLeftIcon aria-hidden="true" />}>
        Voltar ao resumo
      </Link>
    </main>
  );
}
