import { useEffect, useMemo, useRef, useState } from "react";

import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, getRouteApi } from "@tanstack/react-router";
import { z } from "zod";

import {
  allAccountsFilterValue,
  transactionSearchSchema,
  type TransactionFilterFormData,
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
import { getAccountLabel, getCategoryLabel } from "./-components/transaction-labels";
import { TransactionCreationModal } from "./-components/TransactionCreationModal";
import { TransactionDeleteModal } from "./-components/TransactionDeleteModal";
import { TransactionEditModal } from "./-components/TransactionEditModal";
import { prototypeVariantValues, type PrototypeVariant } from "./-prototype/prototype-variants";
import {
  prototypeAccounts,
  prototypeCategories,
  prototypeTransactions,
} from "./-prototype/reference-prototype-data";
import { TransactionsPrototype } from "./-prototype/TransactionsPrototype";

const transactionsRoute = getRouteApi("/_private/transactions/");
const prototypeTransactionSearchSchema = transactionSearchSchema.extend({
  variant: z.enum(prototypeVariantValues).catch("reference").default("reference"),
});

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
  const [editingTarget, setEditingTarget] = useState<ConsultaTransacaoItem | null>(null);
  const [deletingTarget, setDeletingTarget] = useState<ConsultaTransacaoItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const wasFiltersOpenRef = useRef(false);
  const selectedMonth = parseTransactionMonth(search.month);
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
      <TransactionsPrototype
        accounts={accounts}
        categories={categories}
        data={data}
        feedback={feedback}
        filterTriggerRef={filterTriggerRef}
        isFiltersOpen={isFiltersOpen}
        items={visibleItems}
        onApplyFilters={handleApplyFilters}
        onChangeVariant={(variant: PrototypeVariant) => {
          void navigate({
            search: (current) => ({ ...current, variant }),
          });
        }}
        onClearFilters={handleClearFilters}
        onCloseFilters={() => setIsFiltersOpen(false)}
        onDelete={handleDelete}
        onEdit={handleEdit}
        onMonthChange={handleMonthChange}
        onOpenCreation={handleOpenCreation}
        onOpenFilters={() => setIsFiltersOpen(true)}
        search={search}
        selectedMonth={selectedMonth}
        variant={search.variant}
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
  loaderDeps: ({ search }) => ({
    accounts: search.accounts,
    categories: search.categories,
    month: search.month,
    variant: search.variant,
  }),
  loader: ({ context, deps }) => {
    const transactionQuery = transactionsQueryOptions({
      categoriaIds: deps.categories,
      contaIds: getAccountIds(deps.accounts),
      fim: deps.month,
      inicio: deps.month,
    });
    const categoryQuery = categoriesQueryOptions({ ativo: true });
    const accountQuery = accountsQueryOptions();

    if (import.meta.env.DEV) {
      context.queryClient.setQueryData(transactionQuery.queryKey, prototypeTransactions);
      context.queryClient.setQueryData(categoryQuery.queryKey, prototypeCategories);
      context.queryClient.setQueryData(accountQuery.queryKey, prototypeAccounts);

      return Promise.resolve([
        prototypeTransactions,
        prototypeCategories,
        prototypeAccounts,
      ] as const);
    }

    return Promise.all([
      context.queryClient.query({ ...transactionQuery, staleTime: "static" }),
      context.queryClient.query({ ...categoryQuery, staleTime: "static" }),
      context.queryClient.query({ ...accountQuery, staleTime: "static" }),
    ]);
  },
  preloadStaleTime: 30_000,
  validateSearch: prototypeTransactionSearchSchema,
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
