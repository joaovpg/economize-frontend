import { useEffect, useMemo, useRef, useState } from "react";

import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { RepeatIcon } from "@phosphor-icons/react/dist/csr/Repeat";
import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { Button } from "../../components/Button";
import { Card, CardBody, CardHeader } from "../../components/Card";
import { TransactionFilters } from "../../components/TransactionFilters";
import { formatCurrency, formatSignedCurrency } from "../../lib/formatters";
import {
  allAccountsFilterValue,
  getMonthLabel,
  transactionSearchSchema,
  type TransactionFilterFormData,
} from "../../lib/transaction-filters";
import { getContas } from "../../services/accounts/api";
import { type ContaResponse } from "../../services/accounts/contracts";
import { getCategorias } from "../../services/categories/api";
import { type CategoriaResponse } from "../../services/categories/contracts";
import { getTransacoes } from "../../services/transactions/api";
import {
  type ConsultaTransacaoItem,
  type ConsultaTransacoesResponse,
} from "../../services/transactions/contracts";

const transactionsRoute = getRouteApi("/_private/transactions");

type TransactionsPageProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  data: ConsultaTransacoesResponse;
};

function getCategoryLabel(item: ConsultaTransacaoItem, categories: readonly CategoriaResponse[]) {
  if (item.origem === "TRANSFERENCIA") {
    return "Transferência";
  }

  if (item.origem === "SALDO_INICIAL_CONTA") {
    return "Saldo inicial";
  }

  if (item.categoriaId === null) {
    return "Sem categoria";
  }

  return categories.find((category) => category.id === item.categoriaId)?.nome ?? "Sem categoria";
}

function getAccountLabel(item: ConsultaTransacaoItem, accounts: readonly ContaResponse[]) {
  return accounts.find((account) => account.id === item.contaId)?.nome ?? "Conta indisponível";
}

function isRecurringItem(item: ConsultaTransacaoItem) {
  return item.origem === "TRANSACAO_RECORRENTE" || item.origem === "PARCELA";
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
  year: "numeric",
});

function formatTransactionDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

function getItemKey(item: ConsultaTransacaoItem) {
  return `${item.operacaoId ?? item.segmentoRecorrenciaId ?? item.grupoRecorrenciaId ?? "item"}-${item.contaId}-${item.dataFinanceira}-${item.origem}`;
}

function TransactionsPage({ accounts, categories, data }: TransactionsPageProps) {
  const search = transactionsRoute.useSearch();
  const navigate = transactionsRoute.useNavigate();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const wasFiltersOpenRef = useRef(false);
  const allAccountsSelected = search.accounts.includes(allAccountsFilterValue);
  const hasAccountFilter = search.accounts.length > 0 && !allAccountsSelected;
  const selectedCategoryNames = categories
    .filter((category) => search.categories.includes(category.id))
    .map((category) => category.nome);
  const visibleItems = useMemo(() => {
    const normalizedSearchTerm = search.q.trim().toLocaleLowerCase("pt-BR");

    return data.itens.filter((item) => {
      if (normalizedSearchTerm.length === 0) {
        return true;
      }

      return [
        item.descricao,
        getCategoryLabel(item, categories),
        getAccountLabel(item, accounts),
      ].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedSearchTerm));
    });
  }, [accounts, categories, data.itens, search.q]);

  useEffect(() => {
    if (!isFiltersOpen && wasFiltersOpenRef.current) {
      filterTriggerRef.current?.focus();
    }
    wasFiltersOpenRef.current = isFiltersOpen;
  }, [isFiltersOpen]);

  const handleClearFilters = () => {
    void navigate({
      search: (current) => ({
        ...current,
        accounts: [allAccountsFilterValue],
        categories: [],
        q: "",
      }),
    });
  };

  const handleApplyFilters = (formData: TransactionFilterFormData) => {
    void navigate({
      search: (current) => ({
        ...current,
        accounts: formData.accounts,
        categories: formData.categories,
        includePreviousBalance: formData.includePreviousBalance,
        month: formData.month,
        q: formData.search.trim(),
      }),
    });
    setIsFiltersOpen(false);
  };

  return (
    <section className="min-w-0" aria-labelledby="transactions-title">
      <div className="grid min-w-0 grid-cols-[18.25rem_minmax(0,1fr)] items-start max-[48rem]:block">
        <TransactionFilters
          ariaLabel="Filtros de transações"
          accounts={accounts}
          categories={categories}
          filterId="transactions-filters"
          isOpen={isFiltersOpen}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
          onClose={() => setIsFiltersOpen(false)}
          value={{
            accounts: search.accounts,
            categories: search.categories,
            includePreviousBalance: search.includePreviousBalance,
            month: search.month,
            q: search.q,
          }}
        />

        <div className="min-w-0 p-[2rem_1.75rem_2.5rem] max-[48rem]:p-[1.5rem_1rem_2rem]">
          <header className="mb-5.5 flex items-end justify-between gap-4 max-[48rem]:mb-4 max-[48rem]:grid max-[48rem]:items-start max-[48rem]:gap-4">
            <div>
              <h1 className="m-0 text-page-title" id="transactions-title">
                Transações
              </h1>
              <p className="m-0 mt-2.5 text-body-small text-muted">
                Movimentações de {getMonthLabel(data.inicio)}.
              </p>
            </div>
            <Button
              className="hidden! max-[48rem]:inline-flex!"
              variant="secondary"
              size="md"
              ref={filterTriggerRef}
              leadingIcon={<FunnelIcon aria-hidden="true" />}
              aria-expanded={isFiltersOpen}
              aria-controls="transactions-filters"
              onPress={() => setIsFiltersOpen((isOpen) => !isOpen)}
            >
              Filtros
            </Button>
          </header>

          <section
            className="mb-3.5 hidden gap-2.5 max-[48rem]:grid"
            aria-label="Filtros ativos"
            aria-live="polite"
          >
            <span className="text-meta text-subtle uppercase">Filtros ativos</span>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-[color-mix(in_oklch,var(--color-surface)_60%,transparent)] px-2.5 py-1.5 text-caption text-muted">
                Mês: {getMonthLabel(search.month)}
              </span>
              {search.categories.length > 0 && (
                <span className="rounded-full border border-border bg-[color-mix(in_oklch,var(--color-surface)_60%,transparent)] px-2.5 py-1.5 text-caption text-muted">
                  Categorias: {selectedCategoryNames.join(", ")}
                </span>
              )}
              {hasAccountFilter && (
                <span className="rounded-full border border-border bg-[color-mix(in_oklch,var(--color-surface)_60%,transparent)] px-2.5 py-1.5 text-caption text-muted">
                  {`${search.accounts.length} contas`}
                </span>
              )}
            </div>
          </section>

          {search.includePreviousBalance && (
            <Card as="section" className="mb-4" aria-labelledby="opening-balance-title">
              <CardHeader className="items-center">
                <div>
                  <h2 className="m-0 text-title-compact text-foreground" id="opening-balance-title">
                    Saldo de abertura
                  </h2>
                  <p className="m-0 mt-1.5 text-body-small text-muted">
                    Saldo consolidado antes do mês consultado.
                  </p>
                </div>
                <strong className="text-metric whitespace-nowrap text-foreground tabular-nums">
                  {formatCurrency(data.saldoAbertura)}
                </strong>
              </CardHeader>
            </Card>
          )}

          <Card as="section" aria-labelledby="transactions-list-title">
            <CardHeader className="items-baseline">
              <h2 className="m-0 text-title-compact text-foreground" id="transactions-list-title">
                Movimentações
              </h2>
              <span className="text-meta text-subtle">
                {visibleItems.length} {visibleItems.length === 1 ? "item" : "itens"}
              </span>
            </CardHeader>
            <CardBody className="gap-0">
              {visibleItems.length > 0 ? (
                <div className="min-w-0 overflow-hidden">
                  <table className="w-full border-collapse text-left max-[48rem]:block">
                    <caption className="sr-only">Movimentações financeiras</caption>
                    <thead className="max-[48rem]:hidden">
                      <tr className="border-b border-border-strong">
                        <th
                          className="pr-4 pb-3 text-caption-strong tracking-[0.04em] text-muted uppercase"
                          scope="col"
                        >
                          Descrição
                        </th>
                        <th
                          className="pr-4 pb-3 text-caption-strong tracking-[0.04em] text-muted uppercase"
                          scope="col"
                        >
                          Categoria
                        </th>
                        <th
                          className="pr-4 pb-3 text-caption-strong tracking-[0.04em] text-muted uppercase"
                          scope="col"
                        >
                          Conta
                        </th>
                        <th
                          className="pb-3 text-right text-caption-strong tracking-[0.04em] text-muted uppercase"
                          scope="col"
                        >
                          Valor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="max-[48rem]:grid max-[48rem]:gap-2.5">
                      {visibleItems.map((item) => {
                        const recurring = isRecurringItem(item);
                        const valueClassName = item.valor >= 0 ? "text-success" : "text-danger";

                        return (
                          <tr
                            className="border-b border-border last:border-b-0 max-[48rem]:grid max-[48rem]:gap-3 max-[48rem]:rounded-xl max-[48rem]:border max-[48rem]:p-3.5"
                            key={getItemKey(item)}
                          >
                            <td className="max-w-0 py-3 pr-4 align-top max-[48rem]:flex max-[48rem]:items-start max-[48rem]:justify-between max-[48rem]:gap-4 max-[48rem]:border-0 max-[48rem]:p-0">
                              <span className="hidden text-meta text-subtle uppercase max-[48rem]:block">
                                Descrição
                              </span>
                              <div className="min-w-0">
                                <div className="flex min-w-0 items-center gap-1.5">
                                  {recurring && (
                                    <span
                                      className="inline-flex shrink-0 text-brand"
                                      title="Movimento recorrente"
                                    >
                                      <RepeatIcon aria-hidden="true" />
                                      <span className="sr-only">Movimento recorrente</span>
                                    </span>
                                  )}
                                  <span className="truncate text-caption-strong text-foreground">
                                    {item.descricao}
                                  </span>
                                </div>
                                <time
                                  className="mt-0.75 block text-caption text-subtle"
                                  dateTime={item.dataFinanceira}
                                >
                                  {formatTransactionDate(item.dataFinanceira)}
                                </time>
                              </div>
                            </td>
                            <td className="py-3 pr-4 align-top text-caption text-muted max-[48rem]:flex max-[48rem]:items-start max-[48rem]:justify-between max-[48rem]:gap-4 max-[48rem]:border-0 max-[48rem]:p-0">
                              <span className="hidden text-meta text-subtle uppercase max-[48rem]:block">
                                Categoria
                              </span>
                              <span className="text-right max-[48rem]:max-w-[60%]">
                                {getCategoryLabel(item, categories)}
                              </span>
                            </td>
                            <td className="py-3 pr-4 align-top text-caption text-muted max-[48rem]:flex max-[48rem]:items-start max-[48rem]:justify-between max-[48rem]:gap-4 max-[48rem]:border-0 max-[48rem]:p-0">
                              <span className="hidden text-meta text-subtle uppercase max-[48rem]:block">
                                Conta
                              </span>
                              <span className="text-right max-[48rem]:max-w-[60%]">
                                {getAccountLabel(item, accounts)}
                              </span>
                            </td>
                            <td className="py-3 text-right align-top tabular-nums max-[48rem]:flex max-[48rem]:items-start max-[48rem]:justify-between max-[48rem]:gap-4 max-[48rem]:border-0 max-[48rem]:p-0">
                              <span className="hidden text-meta text-subtle uppercase max-[48rem]:block">
                                Valor
                              </span>
                              <strong
                                className={`font-semibold whitespace-nowrap ${valueClassName}`}
                              >
                                {formatSignedCurrency(item.valor)}
                              </strong>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="m-0 rounded-xl border border-dashed border-border-strong p-3.5 text-body-small text-muted">
                  Nenhuma movimentação encontrada com esses filtros.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_private/transactions")({
  validateSearch: transactionSearchSchema,
  loaderDeps: ({ search }) => ({
    accounts: search.accounts,
    categories: search.categories,
    month: search.month,
  }),
  loader: async ({ abortController, deps }) => {
    const accountIds = deps.accounts.reduce<string[]>((ids, accountId) => {
      if (accountId !== allAccountsFilterValue) {
        ids.push(accountId);
      }
      return ids;
    }, []);
    const [data, categories, accounts] = await Promise.all([
      getTransacoes({
        categoriaIds: deps.categories,
        contaIds: accountIds,
        fim: deps.month,
        inicio: deps.month,
        signal: abortController.signal,
      }),
      getCategorias({ ativo: true, signal: abortController.signal }),
      getContas({ signal: abortController.signal }),
    ]);

    return { accounts, categories, data };
  },
  component: TransactionsPageRoute,
  preloadStaleTime: 30_000,
});

function TransactionsPageRoute() {
  const { accounts, categories, data } = Route.useLoaderData();

  return <TransactionsPage accounts={accounts} categories={categories} data={data} />;
}
