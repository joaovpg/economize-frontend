import { useState } from "react";

import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "../../../components/Button";
import { Card, CardBody, CardHeader } from "../../../components/Card";
import { Link } from "../../../components/Link";
import { formatCurrency } from "../../../lib/formatters";
import { accountsQueryOptions } from "../../../services/accounts/queries";
import { AccountEditorModal } from "./-components/AccountEditorModal";

function AccountsPage() {
  const { data: accounts } = useSuspenseQuery(accountsQueryOptions());
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSaved = async (message: string) => {
    setFeedback(message);
  };

  return (
    <section
      aria-labelledby="accounts-title"
      className="flex min-w-0 flex-col pt-8 pr-7 pb-10 pl-7 max-[48rem]:pt-6 max-[48rem]:pr-4 max-[48rem]:pb-8 max-[48rem]:pl-4"
    >
      <div className="flex w-full max-w-5xl flex-col gap-5.5 self-center">
        <Link
          leadingIcon={<ArrowLeftIcon aria-hidden="true" />}
          linkVariant="back"
          to="/summary"
          size="sm"
          variant="link"
        >
          Voltar ao resumo
        </Link>

        <header className="flex items-end justify-between gap-5 max-[40rem]:flex-col max-[40rem]:items-start max-[40rem]:gap-4">
          <div className="flex min-w-0 flex-col gap-2.5">
            <h1 className="text-page-title" id="accounts-title">
              Contas
            </h1>
            <p className="max-w-[48ch] text-body-small text-muted">
              Gerencie as contas usadas nas suas movimentações.
            </p>
          </div>
          <Button
            className="w-full md:w-auto"
            leadingIcon={<PlusIcon aria-hidden="true" />}
            onPress={() => {
              setFeedback(null);
              setIsCreationOpen(true);
            }}
            size="sm"
          >
            Nova conta
          </Button>
        </header>

        {feedback && (
          <output
            aria-live="polite"
            className="block rounded-xl border border-success/25 bg-success-soft px-3.5 py-3 text-body-small text-success"
          >
            {feedback}
          </output>
        )}

        <Card as="section" aria-labelledby="accounts-list-title">
          <CardHeader>
            <div>
              <h2 className="text-title-compact text-foreground" id="accounts-list-title">
                Suas contas
              </h2>
              <p className="text-caption text-muted">
                O saldo inicial é considerado a partir da data cadastrada.
              </p>
            </div>
            <span className="text-meta text-subtle">
              {accounts.length} {accounts.length === 1 ? "conta" : "contas"}
            </span>
          </CardHeader>
          <CardBody>
            {accounts.length > 0 ? (
              <ul className="m-0 grid list-none gap-2.5 p-0">
                {accounts.map((account) => (
                  <li
                    className="flex items-center justify-between gap-4 rounded-xl border border-border px-3.5 py-3"
                    key={account.id}
                  >
                    <div className="min-w-0">
                      <strong className="block truncate text-body-small text-foreground">
                        {account.nome}
                      </strong>
                      <span className="text-caption text-muted">
                        {account.moeda} · desde {account.dataSaldoInicial}
                      </span>
                    </div>
                    <strong className="shrink-0 text-body-small tabular-nums text-foreground">
                      {formatCurrency(account.saldoInicial)}
                    </strong>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="m-0 rounded-xl border border-dashed border-border-strong p-3.5 text-body-small text-muted">
                Nenhuma conta cadastrada.
              </p>
            )}
          </CardBody>
        </Card>
      </div>

      {isCreationOpen && (
        <AccountEditorModal
          onClose={() => setIsCreationOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </section>
  );
}

export const Route = createFileRoute("/_private/accounts/")({
  component: AccountsPage,
  loader: ({ context }) =>
    context.queryClient.query({
      ...accountsQueryOptions(),
      staleTime: "static",
    }),
});
