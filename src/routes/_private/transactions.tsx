import { useEffect, useMemo, useRef, useState } from "react";

import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { Button } from "../../components/Button";
import { Card, CardBody, CardHeader } from "../../components/Card";
import { MonthYearFilter } from "../../components/MonthYearFilter";
import { TransactionFilters } from "../../components/TransactionFilters";
import { formatCurrency } from "../../lib/formatters";
import {
  allAccountsFilterValue,
  getMonthLabel,
  transactionSearchSchema,
  type TransactionFilterFormData,
} from "../../lib/transaction-filters";
import {
  parseTransactionMonth,
  toYearMonth,
  type TransactionMonth,
} from "../../lib/transaction-month";
import { type ContaResponse } from "../../services/accounts/contracts";
import { accountsQueryOptions } from "../../services/accounts/queries";
import { type CategoriaResponse } from "../../services/categories/contracts";
import { categoriesQueryOptions } from "../../services/categories/queries";
import { type ConsultaTransacoesResponse } from "../../services/transactions/contracts";
import { transactionsQueryOptions } from "../../services/transactions/queries";
import { type TransactionActionTarget } from "./transactions/-components/transaction-actions";
import { getAccountLabel, getCategoryLabel } from "./transactions/-components/transaction-labels";
import { TransactionCreationModal } from "./transactions/-components/TransactionCreationModal";
import { TransactionDeleteModal } from "./transactions/-components/TransactionDeleteModal";
import { TransactionEditModal } from "./transactions/-components/TransactionEditModal";
import { TransactionTable } from "./transactions/-components/TransactionTable";

const transactionsRoute = getRouteApi("/_private/transactions");

type TransactionsPageProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  data: ConsultaTransacoesResponse;
};

function getAccountIds(accountFilter: readonly string[]) {
  return accountFilter.filter((accountId) => accountId !== allAccountsFilterValue);
}

function TransactionsPage({ accounts, categories, data }: TransactionsPageProps) {
  const search = transactionsRoute.useSearch();
  const navigate = transactionsRoute.useNavigate();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<TransactionActionTarget | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<TransactionActionTarget | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const wasFiltersOpenRef = useRef(false);
  const selectedMonth = parseTransactionMonth(search.month);
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

  const handleMonthChange = (month: TransactionMonth) => {
    void navigate({
      search: (current) => ({
        ...current,
        month: toYearMonth(month),
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

  const handleOpenCreation = () => {
    setFeedback(null);
    setEditingTarget(null);
    setDeletingTarget(null);
    setIsCreationOpen(true);
  };

  const handleSaved = async (message: string) => {
    setIsCreationOpen(false);
    setEditingTarget(null);
    setDeletingTarget(null);

    setFeedback(message);
  };

  const handleEdit = (target: TransactionActionTarget) => {
    setFeedback(null);
    setIsCreationOpen(false);
    setDeletingTarget(null);
    setEditingTarget(target);
  };

  const handleDelete = (target: TransactionActionTarget) => {
    setFeedback(null);
    setIsCreationOpen(false);
    setEditingTarget(null);
    setDeletingTarget(target);
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
          showMonth={false}
          value={{
            accounts: search.accounts,
            categories: search.categories,
            includePreviousBalance: search.includePreviousBalance,
            month: search.month,
            q: search.q,
          }}
        />

        <div className="min-w-0 pt-8 pr-7 pb-10 pl-7 max-[48rem]:pt-6 max-[48rem]:pr-4 max-[48rem]:pb-8 max-[48rem]:pl-4">
          <header className="mb-5.5 flex items-end justify-between gap-4 max-[48rem]:mb-4 max-[48rem]:grid max-[48rem]:items-start max-[48rem]:gap-4">
            <div>
              <h1 className="m-0 text-page-title" id="transactions-title">
                Transações
              </h1>
              <p className="m-0 mt-2.5 text-body-small text-muted">
                Movimentações de {getMonthLabel(data.inicio)}.
              </p>
            </div>
            <div className="flex items-center gap-2 max-[48rem]:grid max-[48rem]:w-full">
              <Button
                className="max-[48rem]:w-full"
                leadingIcon={<PlusIcon aria-hidden="true" />}
                onPress={handleOpenCreation}
              >
                Nova movimentação
              </Button>
              <MonthYearFilter
                className="max-[48rem]:w-full"
                onChange={handleMonthChange}
                value={selectedMonth}
              />
              <Button
                className="hidden! max-[48rem]:inline-flex! max-[48rem]:w-full"
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
            </div>
          </header>

          {feedback && (
            <output
              aria-live="polite"
              className="mb-4 block rounded-xl border border-success/25 bg-success-soft px-3.5 py-3 text-body-small text-success"
            >
              {feedback}
            </output>
          )}
          <section
            className="mb-3.5 hidden gap-2.5 max-[48rem]:grid"
            aria-label="Filtros ativos"
            aria-live="polite"
          >
            <span className="text-meta text-subtle uppercase">Filtros ativos</span>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-surface-overlay-strong px-2.5 py-1.5 text-caption text-muted">
                Mês: {getMonthLabel(search.month)}
              </span>
              {search.categories.length > 0 && (
                <span className="rounded-full border border-border bg-surface-overlay-strong px-2.5 py-1.5 text-caption text-muted">
                  Categorias: {selectedCategoryNames.join(", ")}
                </span>
              )}
              {hasAccountFilter && (
                <span className="rounded-full border border-border bg-surface-overlay-strong px-2.5 py-1.5 text-caption text-muted">
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
            <CardBody spacing="none">
              {visibleItems.length > 0 ? (
                <TransactionTable
                  accounts={accounts}
                  categories={categories}
                  items={visibleItems}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  openingBalance={data.saldoAbertura}
                />
              ) : (
                <p className="m-0 rounded-xl border border-dashed border-border-strong p-3.5 text-body-small text-muted">
                  Nenhuma movimentação encontrada com esses filtros.
                </p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
      {isCreationOpen && (
        <TransactionCreationModal
          accounts={accounts}
          categories={categories}
          onClose={() => setIsCreationOpen(false)}
          onSaved={handleSaved}
          selectedMonth={selectedMonth}
        />
      )}
      {editingTarget && (
        <TransactionEditModal
          accounts={accounts}
          categories={categories}
          onClose={() => setEditingTarget(null)}
          onSaved={handleSaved}
          selectedMonth={selectedMonth}
          target={editingTarget}
        />
      )}
      {deletingTarget && (
        <TransactionDeleteModal
          onClose={() => setDeletingTarget(null)}
          onDeleted={handleSaved}
          target={deletingTarget}
        />
      )}
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
  loader: ({ context, deps }) =>
    Promise.all([
      context.queryClient.query({
        ...transactionsQueryOptions({
          categoriaIds: deps.categories,
          contaIds: getAccountIds(deps.accounts),
          fim: deps.month,
          inicio: deps.month,
        }),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...categoriesQueryOptions({ ativo: true }),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...accountsQueryOptions(),
        staleTime: "static",
      }),
    ]),
  component: TransactionsPageRoute,
  preloadStaleTime: 30_000,
});

function TransactionsPageRoute() {
  const search = transactionsRoute.useSearch();
  const { data } = useSuspenseQuery(
    transactionsQueryOptions({
      categoriaIds: search.categories,
      contaIds: getAccountIds(search.accounts),
      fim: search.month,
      inicio: search.month,
    }),
  );
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions({ ativo: true }));
  const { data: accounts } = useSuspenseQuery(accountsQueryOptions());

  return <TransactionsPage accounts={accounts} categories={categories} data={data} />;
}
