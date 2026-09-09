import { createFileRoute } from "@tanstack/react-router";

import { ComingSoonPage } from "../../components/layouts/ComingSoonPage";

export const Route = createFileRoute("/_private/transactions")({
  component: TransactionsRoute,
  loader: async () => ({
    description: "Acompanhe e organize todos os seus movimentos em um só lugar.",
    title: "Transações",
  }),
});

function TransactionsRoute() {
  const { description, title } = Route.useLoaderData();

  return <ComingSoonPage description={description} title={title} />;
}
