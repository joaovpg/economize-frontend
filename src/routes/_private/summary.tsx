import { useEffect, useRef, useState } from "react";

import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, getRouteApi } from "@tanstack/react-router";

import { Button } from "../../components/Button";
import { Card, CardBody, CardHeader } from "../../components/Card";
import { TransactionFilters } from "../../components/TransactionFilters";
import {
  allAccountsFilterValue,
  getMonthLabel,
  summarySearchSchema,
  type TransactionFilterFormData,
} from "../../lib/transaction-filters";
import { type ContaResponse } from "../../services/accounts/contracts";
import { accountsQueryOptions } from "../../services/accounts/queries";
import { type CategoriaResponse } from "../../services/categories/contracts";
import { categoriesQueryOptions } from "../../services/categories/queries";

const summaryRoute = getRouteApi("/_private/summary");

type SummaryPageProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
};

function SummaryPage({ accounts, categories }: SummaryPageProps) {
  const search = summaryRoute.useSearch();
  const navigate = summaryRoute.useNavigate();
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const wasFiltersOpenRef = useRef(false);
  const selectedCategoryNames = categories
    .filter((category) => search.categories.includes(category.id))
    .map((category) => category.nome);
  const allAccountsSelected = search.accounts.includes(allAccountsFilterValue);
  const hasAccountFilter = search.accounts.length > 0 && !allAccountsSelected;
  const activeFilterCount =
    1 +
    Number(search.q.trim().length > 0) +
    Number(search.categories.length > 0) +
    Number(hasAccountFilter);

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
    <section className="min-w-0" aria-labelledby="summary-title">
      <div className="grid min-w-0 grid-cols-[18.25rem_minmax(0,1fr)] items-start max-[48rem]:block">
        <TransactionFilters
          ariaLabel="Filtros do resumo"
          accounts={accounts}
          categories={categories}
          filterId="summary-filters"
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

        <div className="min-w-0 pt-8 pr-7 pb-10 pl-7 max-[48rem]:pt-6 max-[48rem]:pr-4 max-[48rem]:pb-8 max-[48rem]:pl-4">
          <header className="mb-5.5 flex items-end justify-between gap-4 max-[48rem]:mb-4 max-[48rem]:grid max-[48rem]:items-start max-[48rem]:gap-4">
            <div>
              <h1 className="m-0 text-page-title" id="summary-title">
                Resumo
              </h1>
              <p className="m-0 mt-2.5 text-body-small text-muted">
                Resumo financeiro do mês selecionado.
              </p>
            </div>
            <Button
              className="hidden! max-[48rem]:inline-flex!"
              variant="secondary"
              size="md"
              ref={filterTriggerRef}
              leadingIcon={<FunnelIcon aria-hidden="true" />}
              aria-expanded={isFiltersOpen}
              aria-controls="summary-filters"
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

          <Card as="section" aria-labelledby="summary-empty-title">
            <CardHeader>
              <div>
                <h2 className="m-0 text-title-compact text-foreground" id="summary-empty-title">
                  Resumo indisponível
                </h2>
                <p className="m-0 mt-1.5 text-body-small text-muted">
                  O resumo será disponibilizado quando existir uma rota própria para seus dados.
                </p>
              </div>
              <span className="text-meta text-subtle">
                {activeFilterCount} {activeFilterCount === 1 ? "filtro" : "filtros"}
              </span>
            </CardHeader>
            <CardBody>
              <p className="m-0 text-body-small text-muted">
                Enquanto isso, consulte suas movimentações na tela de transações.
              </p>
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_private/summary")({
  component: SummaryPageRoute,
  loader: ({ context }) =>
    Promise.all([
      context.queryClient.query({
        ...categoriesQueryOptions({ ativo: true }),
        staleTime: "static",
      }),
      context.queryClient.query({
        ...accountsQueryOptions(),
        staleTime: "static",
      }),
    ]),
  preloadStaleTime: 30_000,
  validateSearch: summarySearchSchema,
});

function SummaryPageRoute() {
  const { data: categories } = useSuspenseQuery(categoriesQueryOptions({ ativo: true }));
  const { data: accounts } = useSuspenseQuery(accountsQueryOptions());

  return <SummaryPage accounts={accounts} categories={categories} />;
}
