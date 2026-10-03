import { useEffect, useMemo, useRef, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import {
  allAccountsFilterValue,
  transactionRouteSearchSchema,
  type TransactionFilterFormData,
  type TransactionFilterState,
} from "../../../lib/transaction-filters";
import {
  parseTransactionMonth,
  toYearMonth,
  type TransactionMonth,
} from "../../../lib/transaction-month";
import { type ContaResponse } from "../../../services/accounts/contracts";
import { accountsQueryOptions } from "../../../services/accounts/queries";
import { type CategoriaResponse } from "../../../services/categories/contracts";
import { categoriesQueryOptions } from "../../../services/categories/queries";
import {
  type ConsultaTransacaoItem,
  type ConsultaTransacoesResponse,
} from "../../../services/transactions/contracts";
import { transactionsQueryOptions } from "../../../services/transactions/queries";
import {
  scheduleTransactionSearch,
  useTransactionFilterStore,
} from "../../../stores/transaction-filters";
import { getAccountLabel, getCategoryLabel } from "./-components/transaction-labels";
import { TransactionCreationModal } from "./-components/TransactionCreationModal";
import { TransactionDeleteModal } from "./-components/TransactionDeleteModal";
import { TransactionEditModal } from "./-components/TransactionEditModal";
import { TransactionsView } from "./-components/TransactionsView";

const transactionsRoute = getRouteApi("/_private/transactions/");

type TransactionsPageProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  data: ConsultaTransacoesResponse;
};

function getAccountIds(accountFilter: readonly string[]) {
  if (accountFilter.includes(allAccountsFilterValue)) {
    return [];
  }

  return accountFilter.filter((accountId) => accountId !== allAccountsFilterValue);
}

function handleClearFilters() {
  useTransactionFilterStore.getState().clearFilters();
}

function handleApplyFilters(formData: TransactionFilterFormData) {
  useTransactionFilterStore.getState().setFilters({
    accounts: formData.accounts,
    categories: formData.categories,
    includePreviousBalance: formData.includePreviousBalance,
    q: formData.search.trim(),
  });
}

function TransactionsPage({ accounts, categories, data }: TransactionsPageProps) {
  const search = transactionsRoute.useSearch();
  const navigate = transactionsRoute.useNavigate();
  const filterStore = useTransactionFilterStore();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isCreationOpen, setIsCreationOpen] = useState(false);
  const [editingTarget, setEditingTarget] = useState<ConsultaTransacaoItem | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<ConsultaTransacaoItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const wasFiltersOpenRef = useRef(false);
  const selectedMonth = parseTransactionMonth(search.month);
  const filterState: TransactionFilterState = {
    accounts: filterStore.accounts,
    categories: filterStore.categories,
    includePreviousBalance: filterStore.includePreviousBalance,
    month: search.month,
    q: filterStore.q,
  };
  const selectedAccountIds = getAccountIds(filterState.accounts);
  const hasTransactionScope =
    selectedAccountIds.length > 0 ||
    filterState.categories.length > 0 ||
    filterState.q.trim().length > 0;
  const visibleItems = useMemo(() => {
    const normalizedSearchTerm = filterState.q.trim().toLocaleLowerCase("pt-BR");

    return data.itens.filter((item) => {
      if (selectedAccountIds.length > 0 && !selectedAccountIds.includes(item.contaId)) {
        return false;
      }

      if (
        filterState.categories.length > 0 &&
        (!item.categoriaId || !filterState.categories.includes(item.categoriaId))
      ) {
        return false;
      }

      if (normalizedSearchTerm.length === 0) {
        return true;
      }

      return [
        item.descricao,
        getCategoryLabel(item, categories),
        getAccountLabel(item, accounts),
      ].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedSearchTerm));
    });
  }, [accounts, categories, data.itens, filterState.categories, filterState.q, selectedAccountIds]);

  useEffect(() => {
    if (!isFiltersOpen && wasFiltersOpenRef.current) {
      filterTriggerRef.current?.focus();
    }
    wasFiltersOpenRef.current = isFiltersOpen;
  }, [isFiltersOpen]);

  const handleMonthChange = (month: TransactionMonth) => {
    void navigate({
      search: (current) => ({
        ...current,
        month: toYearMonth(month),
      }),
    });
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

  const handleEdit = (target: ConsultaTransacaoItem) => {
    setFeedback(null);
    setIsCreationOpen(false);
    setDeletingTarget(null);
    setEditingTarget(target);
  };

  const handleDelete = (target: ConsultaTransacaoItem) => {
    setFeedback(null);
    setIsCreationOpen(false);
    setEditingTarget(null);
    setDeletingTarget(target);
  };

  return (
    <section className="min-w-0" aria-labelledby="transactions-title">
      <TransactionsView
        accounts={accounts}
        categories={categories}
        data={data}
        feedback={feedback}
        filterTriggerRef={filterTriggerRef}
        hasTransactionScope={hasTransactionScope}
        isFiltersOpen={isFiltersOpen}
        items={visibleItems}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        onCloseFilters={() => setIsFiltersOpen(false)}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onMonthChange={handleMonthChange}
        onOpenCreation={handleOpenCreation}
        onOpenFilters={() => setIsFiltersOpen(true)}
        onSearchChange={scheduleTransactionSearch}
        search={filterState}
        selectedMonth={selectedMonth}
      />
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

export const Route = createFileRoute("/_private/transactions/")({
  component: TransactionsPageRoute,
  loaderDeps: ({ search }) => ({ month: search.month }),
  loader: ({ context, deps }) => {
    const transactionQuery = transactionsQueryOptions({
      fim: deps.month,
      inicio: deps.month,
    });
    const categoryQuery = categoriesQueryOptions({ ativo: true });
    const accountQuery = accountsQueryOptions();

    return Promise.all([
      context.queryClient.query({ ...transactionQuery, staleTime: "static" }),
      context.queryClient.query({ ...categoryQuery, staleTime: "static" }),
      context.queryClient.query({ ...accountQuery, staleTime: "static" }),
    ]);
  },
  preloadStaleTime: 30_000,
  validateSearch: transactionRouteSearchSchema,
});

function TransactionsPageRoute() {
  const search = transactionsRoute.useSearch();
  const { data } = useSuspenseQuery(
    transactionsQueryOptions({
      fim: search.month,
      inicio: search.month,
    }),
  );
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions({ ativo: true }));
  const { data: accounts } = useSuspenseQuery(accountsQueryOptions());

  return <TransactionsPage accounts={accounts} categories={categories} data={data} />;
}
