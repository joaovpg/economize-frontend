import { useState } from "react";

import { ArrowLeftIcon } from "@phosphor-icons/react/dist/csr/ArrowLeft";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { Button } from "../../../components/Button";
import { Card, CardBody, CardHeader } from "../../../components/Card";
import { IconSlot } from "../../../components/IconSlot";
import { InlineMessage } from "../../../components/InlineMessage";
import { Link } from "../../../components/Link";
import { PageHeading } from "../../../components/PageHeading";
import { Switch } from "../../../components/Switch";
import { isApiError } from "../../../lib/api-errors";
import { putConta } from "../../../services/accounts/api";
import { type ContaResponse } from "../../../services/accounts/contracts";
import { accountsQueryKey, accountsQueryOptions } from "../../../services/accounts/queries";
import { transactionsQueryKey } from "../../../services/transactions/queries";
import { AccountEditorModal } from "./-components/AccountEditorModal";
import { AccountToggleConfirmation } from "./-components/AccountToggleConfirmation";

import type { PendingAccountToggle } from "./-components/account-types";

type AccountEditorValue = ContaResponse | null | undefined;

function getErrorMessage(error: unknown, fallback: string) {
  if (!isApiError(error)) {
    return fallback;
  }

  return error.problem?.detail ?? error.message ?? fallback;
}

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
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-caption ${isActive ? "border-success/25 bg-success-soft text-success" : "border-warning/25 bg-warning-soft text-warning"}`}
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
        <h3 className="text-title text-foreground">
          {hasAccounts && isFiltered ? "Nenhuma conta nesse filtro" : "Nenhuma conta cadastrada"}
        </h3>
        <p className="m-0 max-w-[36ch] text-body text-muted">
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
  const queryClient = useQueryClient();
  const toggleAccountMutation = useMutation({
    mutationFn: ({ account, nextActive }: PendingAccountToggle) =>
      putConta(account.id, {
        ativo: nextActive,
        dataSaldoInicial: account.dataSaldoInicial,
        moeda: account.moeda,
        nome: account.nome,
        saldoInicial: account.saldoInicial,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountsQueryKey }).catch(() => undefined);
      void queryClient.invalidateQueries({ queryKey: transactionsQueryKey }).catch(() => undefined);
    },
  });
  const [accountStatus, setAccountStatus] = useState<AccountStatusFilter>("all");
  const [editorAccount, setEditorAccount] = useState<AccountEditorValue>(undefined);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null);
  const [pendingToggle, setPendingToggle] = useState<PendingAccountToggle | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);
  const filteredAccounts = filterAccounts(accounts, accountStatus);

  const handleSaved = async (message: string) => {
    setFeedback(message);
  };

  const commitAccountToggle = async ({ account, nextActive }: PendingAccountToggle) => {
    if (pendingAccountId !== null) {
      return;
    }

    setFeedback(null);
    setToggleError(null);
    setPendingAccountId(account.id);

    try {
      await toggleAccountMutation.mutateAsync({ account, nextActive });
    } catch (error) {
      setToggleError(
        getErrorMessage(
          error,
          nextActive
            ? "Não foi possível ativar a conta. Tente novamente."
            : "Não foi possível inativar a conta. Tente novamente.",
        ),
      );
      setPendingAccountId(null);
      return;
    }

    setPendingToggle(null);
    setFeedback(nextActive ? "Conta ativada com sucesso." : "Conta inativada com sucesso.");
    setPendingAccountId(null);
  };

  const handleAccountToggle = (account: ContaResponse, nextActive: boolean) => {
    if (pendingAccountId !== null) {
      return;
    }

    setFeedback(null);
    setToggleError(null);

    if (!nextActive) {
      setPendingToggle({ account, nextActive });
      return;
    }

    void commitAccountToggle({ account, nextActive });
  };

  const handleEdit = (account: ContaResponse) => {
    setFeedback(null);
    setToggleError(null);
    setEditorAccount(account);
  };

  const handleOpenCreate = () => {
    setFeedback(null);
    setToggleError(null);
    setEditorAccount(null);
  };

  return (
    <section
      aria-labelledby="accounts-title"
      className="flex min-w-0 flex-col px-0 pt-7 pb-10 max-[64rem]:px-4 max-[48rem]:pt-5.5 max-[48rem]:pb-8"
    >
      <div className="flex w-full max-w-320 flex-col gap-7 self-center">
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
            isDisabled={pendingAccountId !== null}
            leadingIcon={<PlusIcon aria-hidden="true" />}
            onPress={handleOpenCreate}
            size="md"
          >
            Nova conta
          </Button>
        </header>

        {feedback && <InlineMessage>{feedback}</InlineMessage>}
        {toggleError && !pendingToggle && (
          <InlineMessage tone="danger">{toggleError}</InlineMessage>
        )}

        <Card as="section" aria-labelledby="accounts-list-title">
          <CardHeader className="flex-col items-start md:flex-row md:items-center">
            <div className="min-w-0">
              <h2 className="m-0 text-title text-foreground" id="accounts-list-title">
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
                        className="px-5.5 py-3.5 text-left text-caption text-subtle max-[40rem]:px-4"
                        scope="col"
                      >
                        Conta
                      </th>
                      <th
                        className="px-5.5 py-3.5 text-left text-caption text-subtle max-[40rem]:px-4"
                        scope="col"
                      >
                        Status
                      </th>
                      <th
                        className="px-5.5 py-3.5 text-left text-caption text-subtle max-[40rem]:hidden"
                        scope="col"
                      >
                        Data inicial
                      </th>
                      <th
                        className="px-5.5 py-3.5 text-right text-caption text-subtle max-[40rem]:px-4"
                        scope="col"
                      >
                        Saldo inicial
                      </th>
                      <th
                        className="px-5.5 py-3.5 text-right text-caption text-subtle max-[40rem]:px-4"
                        scope="col"
                      >
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((account) => (
                      <tr className="border-b border-border last:border-b-0" key={account.id}>
                        <td className="min-w-0 px-5.5 py-4 align-middle max-[40rem]:px-4">
                          <span className="block truncate text-body-strong text-foreground">
                            {account.nome}
                          </span>
                          <span className="mt-1 block text-caption text-subtle">
                            {account.moeda}
                          </span>
                        </td>
                        <td className="px-5.5 py-4 align-middle max-[40rem]:px-4">
                          <AccountStatus isActive={account.ativo} />
                        </td>
                        <td className="px-5.5 py-4 align-middle text-body text-muted max-[40rem]:hidden">
                          {formatInitialBalanceDate(account.dataSaldoInicial)}
                        </td>
                        <td className="px-5.5 py-4 text-right align-middle text-body-strong text-foreground tabular-nums max-[40rem]:px-4">
                          {formatAccountBalance(account.saldoInicial, account.moeda)}
                        </td>
                        <td className="px-5.5 py-4 align-middle max-[40rem]:px-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              aria-label={`Editar conta ${account.nome}`}
                              isDisabled={pendingAccountId !== null}
                              isIconOnly
                              onPress={() => handleEdit(account)}
                              size="sm"
                              variant="ghost"
                            >
                              <PencilSimpleIcon aria-hidden="true" />
                            </Button>
                            <Switch
                              aria-label={`${account.ativo ? "Inativar" : "Ativar"} conta ${account.nome}`}
                              isDisabled={pendingAccountId !== null}
                              isSelected={account.ativo}
                              onChange={(nextActive) => handleAccountToggle(account, nextActive)}
                            />
                            {pendingAccountId === account.id && (
                              <span className="sr-only">Salvando alteração</span>
                            )}
                          </div>
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

      {editorAccount !== undefined && (
        <AccountEditorModal
          account={editorAccount}
          onClose={() => setEditorAccount(undefined)}
          onSaved={handleSaved}
        />
      )}
      <AccountToggleConfirmation
        errorMessage={toggleError}
        isPending={pendingAccountId !== null}
        onCancel={() => {
          if (pendingAccountId === null) {
            setPendingToggle(null);
            setToggleError(null);
          }
        }}
        onConfirm={() => {
          if (pendingToggle) {
            void commitAccountToggle(pendingToggle);
          }
        }}
        pendingToggle={pendingToggle}
      />
    </section>
  );
}

export const Route = createFileRoute("/_private/accounts/")({
  component: AccountsPage,
  loader: ({ context }) => context.queryClient.query(accountsQueryOptions()),
});
