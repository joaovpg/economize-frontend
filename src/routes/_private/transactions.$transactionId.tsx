import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { Link } from "../../components/Link";
import { RouteError, RoutePending } from "../../components/RouteStates";
import { getTransaction, type TransactionData } from "../../lib/summary";

export const Route = createFileRoute("/_private/transactions/$transactionId")({
  component: TransactionDetailRoute,
  errorComponent: RouteError,
  loader: async ({ params }) => {
    const transaction = await getTransaction(params.transactionId);

    if (!transaction) {
      throw notFound();
    }

    return transaction;
  },
  pendingComponent: RoutePending,
});

function TransactionDetailRoute() {
  const transaction = Route.useLoaderData();

  return <TransactionDetailPage transaction={transaction} />;
}

type TransactionDetailPageProps = {
  transaction: TransactionData;
};

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  minimumFractionDigits: 2,
  style: "currency",
});

function TransactionDetailPage({ transaction }: TransactionDetailPageProps) {
  const signedValue = transaction.kind === "expense" ? -transaction.value : transaction.value;

  return (
    <main className="grid max-w-152 gap-5 px-7 py-16" aria-labelledby="transaction-title">
      <Link to="/summary" variant="link" leadingIcon={<ArrowLeftIcon aria-hidden="true" />}>
        Voltar ao resumo
      </Link>
      <div className="grid gap-2">
        <p className="m-0 text-caption-strong tracking-[0.04em] text-subtle uppercase">
          Detalhe da transação
        </p>
        <h1 className="m-0 text-page-title" id="transaction-title">
          {transaction.description}
        </h1>
        <p className="m-0 text-body-small text-muted">
          {transaction.category} · {transaction.account} · {transaction.dateLabel}
        </p>
      </div>
      <p
        className={`m-0 text-metric ${transaction.kind === "expense" ? "text-danger" : "text-success"}`}
      >
        {signedValue >= 0 ? "+ " : "− "}
        {currencyFormatter.format(Math.abs(signedValue))}
      </p>
      <p className="m-0 text-body-small text-subtle">
        Identificador: <code>{transaction.id}</code>
      </p>
    </main>
  );
}
