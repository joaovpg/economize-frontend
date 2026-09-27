import { useState } from "react";

import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "../../../components/Button";
import { Card, CardBody, CardHeader } from "../../../components/Card";
import { IconSlot } from "../../../components/IconSlot";
import { InlineMessage } from "../../../components/InlineMessage";
import { Link } from "../../../components/Link";
import { PageHeading } from "../../../components/PageHeading";
import { type ContaResponse } from "../../../services/accounts/contracts";
import { accountsQueryOptions } from "../../../services/accounts/queries";
import { AccountEditorModal } from "./-components/AccountEditorModal";

const accountStatusFilters = [
  { label: "Todas", value: "all" },
  { label: "Ativas", value: "active" },
  { label: "Inativas", value: "inactive" },
] as const;

type AccountStatusFilter = (typeof accountStatusFilters)[number]["value"];

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: "UTC",
});

function formatInitialBalanceDate(value: string) {
  return shortDateFormatter.format(new Date(`${value}T00:00:00Z`));
}

function formatAccountBalance(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("pt-BR", {
      currency,
      currencyDisplay: "symbol",
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
      style: "currency",
    }).format(value);
  } catch {
    return `${currency} ${value.toLocaleString("pt-BR", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    })}`;
  }
}

function filterAccounts(accounts: readonly ContaResponse[], status: AccountStatusFilter) {
  switch (status) {
    case "all":
      return accounts;
    case "active":
      return accounts.filter((account) => account.ativo);
    case "inactive":
      return accounts.filter((account) => !account.ativo);
  }

  const exhaustive: never = status;
  return exhaustive;
}

function AccountStatus({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-caption-strong ${isActive ? "border-success/25 bg-success-soft text-success" : "border-warning/25 bg-warning-soft text-warning"}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {isActive ? "Ativa" : "Inativa"}
    </span>
  );
}

function AccountsEmptyState({
  hasAccounts,
  status,
}: {
  hasAccounts: boolean;
  status: AccountStatusFilter;
}) {
  const isFiltered = status !== "all";

  return (
    <div className="grid justify-items-center gap-3.5 px-4 py-10 text-center">
      <div className="grid size-12 place-items-center rounded-2xl bg-brand-soft text-xl text-brand-hover">
        <IconSlot>
          {isFiltered ? (
            <MagnifyingGlassIcon aria-hidden="true" />
          ) : (
            <PlusIcon aria-hidden="true" />
          )}
        </IconSlot>
      </div>
      <div className="grid gap-1.5">
        <h3 className="text-title-compact text-foreground">
          {hasAccounts && isFiltered ? "Nenhuma conta nesse filtro" : "Nenhuma conta cadastrada"}
        </h3>
        <p className="m-0 max-w-[36ch] text-body-small text-muted">
          {hasAccounts && isFiltered
            ? "Altere o filtro para visualizar outras contas."
            : "Crie uma conta para começar a registrar suas movimentações."}
        </p>
      </div>
    </div>
  );
}

function AccountsPage() {
  const { data: accounts } = useSuspenseQuery(accountsQueryOptions());
  const [accountStatus, setAccountStatus] = useState<AccountStatusFilter>("all");
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const filteredAccounts = filterAccounts(accounts, accountStatus);

  const handleSaved = async (message: string) => {
    setFeedback(message);
  };

  return (
    <section
      aria-labelledby="accounts-title"
      className="flex min-w-0 flex-col px-0 pt-7 pb-10 max-[64rem]:px-4 max-[48rem]:pt-5.5 max-[48rem]:pb-8"
    >
      <div className="flex w-full max-w-260 flex-col gap-7 self-center">
        <Link
          className="justify-start! self-start"
          leadingIcon={<ArrowLeftIcon aria-hidden="true" />}
          linkVariant="back"
          to="/transactions"
          size="sm"
          variant="link"
        >
          Voltar para transações
        </Link>

        <header className="flex items-end justify-between gap-5 max-[40rem]:flex-col max-[40rem]:items-start max-[40rem]:gap-4">
          <PageHeading
            description="Tenha suas contas em um só lugar para registrar movimentações com mais contexto."
            eyebrow="Organização financeira"
            id="accounts-title"
            title="Contas"
          />
          <Button
            className="w-full md:w-auto"
            leadingIcon={<PlusIcon aria-hidden="true" />}
            onPress={() => {
              setFeedback(null);
              setIsCreationOpen(true);
            }}
            size="md"
          >
            Nova conta
          </Button>
        </header>

        {feedback && <InlineMessage>{feedback}</InlineMessage>}

        <Card as="section" aria-labelledby="accounts-list-title">
          <CardHeader className="flex-col items-start md:flex-row md:items-center">
            <div className="min-w-0">
              <h2 className="m-0 text-title-compact text-foreground" id="accounts-list-title">
                Todas as contas
              </h2>
              <p className="m-0 mt-1.5 text-caption text-muted">
                {filteredAccounts.length}{" "}
                {filteredAccounts.length === 1 ? "registro encontrado" : "registros encontrados"}
              </p>
            </div>
            <fieldset className="flex flex-wrap gap-2 border-0 p-0">
              <legend className="sr-only">Filtrar contas por status</legend>
              {accountStatusFilters.map((filter) => {
                return (
                  <Button
                    aria-pressed={filter.value === accountStatus}
                    key={filter.value}
                    onPress={() => setAccountStatus(filter.value)}
                    size="sm"
                    variant="filter"
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </fieldset>
          </CardHeader>
          <CardBody spacing="none">
            {filteredAccounts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <caption className="sr-only">Contas cadastradas</caption>
                  <thead>
                    <tr className="border-b border-border">
                      <th
                        className="px-5.5 py-3.5 text-left text-caption-strong tracking-label text-subtle uppercase max-[40rem]:px-4"
                        scope="col"
                      >
                        Conta
                      </th>
                      <th
                        className="px-5.5 py-3.5 text-left text-caption-strong tracking-label text-subtle uppercase max-[40rem]:px-4"
                        scope="col"
                      >
                        Status
                      </th>
                      <th
                        className="px-5.5 py-3.5 text-left text-caption-strong tracking-label text-subtle uppercase max-[40rem]:hidden"
                        scope="col"
                      >
                        Data inicial
                      </th>
                      <th
                        className="px-5.5 py-3.5 text-right text-caption-strong tracking-label text-subtle uppercase max-[40rem]:px-4"
                        scope="col"
                      >
                        Saldo inicial
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => (
                      <tr className="border-b border-border last:border-b-0" key={account.id}>
                        <td className="min-w-0 px-5.5 py-4 align-middle max-[40rem]:px-4">
                          <span className="block truncate text-label text-foreground">
                            {account.nome}
                          </span>
                          <span className="mt-1 block text-caption text-subtle">
                            {account.moeda}
                          </span>
                        </td>
                        <td className="px-5.5 py-4 align-middle max-[40rem]:px-4">
                          <AccountStatus isActive={account.ativo} />
                        </td>
                        <td className="px-5.5 py-4 align-middle text-body-small text-muted max-[40rem]:hidden">
                          {formatInitialBalanceDate(account.dataSaldoInicial)}
                        </td>
                        <td className="px-5.5 py-4 text-right align-middle text-label text-foreground tabular-nums max-[40rem]:px-4">
                          {formatAccountBalance(account.saldoInicial, account.moeda)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <AccountsEmptyState hasAccounts={accounts.length > 0} status={accountStatus} />
            )}
          </CardBody>
        </Card>
      </div>

      {isCreationOpen && (
        <AccountEditorModal onClose={() => setIsCreationOpen(false)} onSaved={handleSaved} />
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
