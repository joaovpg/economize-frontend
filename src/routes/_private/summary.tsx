import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import {
  Button as AriaButton,
  Input,
  Label,
  ListBox,
  ListBoxItem,
  Popover,
  Select,
  SelectValue,
  TextField as AriaTextField,
} from "react-aria-components";
import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarBlankIcon } from "@phosphor-icons/react/dist/csr/CalendarBlank";
import { CaretDownIcon } from "@phosphor-icons/react/dist/csr/CaretDown";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { getRouteApi } from "@tanstack/react-router";
import { z } from "zod";

import { Button } from "../../components/Button";
import { Card, CardHeader, CardBody, CardFooter } from "../../components/Card";
import { Checkbox } from "../../components/Checkbox";
import { FilterTree, type FilterTreeItem } from "../../components/FilterTree";
import { Link } from "../../components/Link";
import { formatCurrency, formatSignedCurrency } from "../../lib/formatters";
import {
  accountFilterValueSchema,
  allAccountsFilterValue,
  demoAccountResources,
  demoCategoryResources,
  categoryFilterValueSchema,
  getSummaryData,
  type AccountFilterValue,
  type CategoryExpense,
  type DemoCategoryResource,
  type SummaryData,
  type SummaryFilterResource,
  type SummaryMonth,
  monthOptions,
  summaryMonthValues,
  summarySearchSchema,
} from "../../lib/summary";
import { getContas } from "../../services/accounts/api";
import { type ContaResponse } from "../../services/accounts/contracts";
import { getCategorias } from "../../services/categories/api";
import { type CategoriaResponse } from "../../services/categories/contracts";
import {
  summaryFiltersStyles,
  summarySelectTriggerStyles,
  summaryStatusStyles,
  summaryStyles,
} from "./-summaryStyles";

type CategoryBarStyle = CSSProperties & {
  "--category-share": string;
};

function getCategoryBarStyle(share: number): CategoryBarStyle {
  return { "--category-share": `${share}%` };
}

function getCategoryExpenseName(filterCategory: string) {
  return filterCategory === "Aluguel" ? "Moradia" : filterCategory;
}

const summaryFilterSchema = z.object({
  accounts: z.array(accountFilterValueSchema),
  categories: z.array(categoryFilterValueSchema),
  includePreviousBalance: z.boolean(),
  month: z.enum(summaryMonthValues),
  search: z.string(),
});

type SummaryFilterFormData = z.infer<typeof summaryFilterSchema>;

type CategoryResource =
  | Pick<CategoriaResponse, "id" | "nome" | "categoriaPaiId">
  | DemoCategoryResource;

function getSelectedResourceNames(
  resources: readonly SummaryFilterResource[],
  selectedIds: readonly string[],
) {
  const selectedIdSet = new Set(selectedIds);

  return new Set(
    resources.filter((resource) => selectedIdSet.has(resource.id)).map((resource) => resource.nome),
  );
}

function buildCategoryTreeItems(
  categories: readonly CategoryResource[],
): readonly FilterTreeItem[] {
  const categoryById = new Map<string, CategoryResource>(
    categories.map((category): [string, CategoryResource] => [category.id, category]),
  );
  const childrenByParentId = new Map<string, CategoryResource[]>();

  for (const category of categories) {
    if (category.categoriaPaiId === null) {
      continue;
    }

    const children = childrenByParentId.get(category.categoriaPaiId) ?? [];
    children.push(category);
    childrenByParentId.set(category.categoriaPaiId, children);
  }

  const rootCategories = categories.filter(
    (category) => category.categoriaPaiId === null || !categoryById.has(category.categoriaPaiId),
  );

  const buildItem = (
    category: CategoryResource,
    ancestorIds: ReadonlySet<string>,
  ): FilterTreeItem => {
    const children = (childrenByParentId.get(category.id) ?? []).filter(
      (child) => !ancestorIds.has(child.id),
    );

    if (children.length === 0) {
      return { id: category.id, label: category.nome };
    }

    const nextAncestorIds = new Set(ancestorIds);
    nextAncestorIds.add(category.id);

    return {
      children: children.map((child) => buildItem(child, nextAncestorIds)),
      id: category.id,
      label: category.nome,
    };
  };

  return rootCategories.map((category) => buildItem(category, new Set()));
}

const demoCategoriesGroupId = "categorias-demonstrativas";

function buildCategoryFilterItems(
  categories: readonly CategoriaResponse[],
  demoCategories: readonly DemoCategoryResource[],
): readonly FilterTreeItem[] {
  return [
    ...buildCategoryTreeItems(categories),
    {
      children: buildCategoryTreeItems(demoCategories),
      id: demoCategoriesGroupId,
      label: "Dados demonstrativos",
    },
  ];
}

const inactiveAccountsGroupId = "contas-inativas";
const demoAccountsGroupId = "contas-demonstrativas";

function buildAccountFilterItems(
  accounts: readonly ContaResponse[],
  demoAccounts: readonly SummaryFilterResource[],
): readonly FilterTreeItem[] {
  const activeAccounts = accounts.filter((account) => account.ativo);
  const inactiveAccounts = accounts.filter((account) => !account.ativo);
  const items: FilterTreeItem[] = [
    { id: allAccountsFilterValue, label: allAccountsFilterValue },
    ...activeAccounts.map((account) => ({ id: account.id, label: account.nome })),
  ];

  if (inactiveAccounts.length > 0) {
    items.push({
      children: inactiveAccounts.map((account) => ({ id: account.id, label: account.nome })),
      id: inactiveAccountsGroupId,
      label: "Contas inativas",
    });
  }

  items.push({
    children: demoAccounts.map((account) => ({ id: account.id, label: account.nome })),
    id: demoAccountsGroupId,
    label: "Contas demonstrativas",
  });

  return items;
}

const summaryRoute = getRouteApi("/_private/summary");

type SummaryCheckboxProps = {
  children: ReactNode;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
  placement?: "filter" | "ledger";
};

function SummaryCheckbox({
  children,
  isSelected,
  onChange,
  placement = "filter",
}: SummaryCheckboxProps) {
  return (
    <Checkbox
      isSelected={isSelected}
      onChange={onChange}
      size={placement === "ledger" ? "compact" : "default"}
    >
      {children}
    </Checkbox>
  );
}

type SummaryMonthSelectProps = {
  label: string;
  onChange: (value: SummaryMonth) => void;
  placement: "filter" | "header";
  value: SummaryMonth;
};

function SummaryMonthSelect({ label, onChange, placement, value }: SummaryMonthSelectProps) {
  return (
    <Select
      aria-label={label}
      className={summaryStyles.selectRoot}
      onSelectionChange={(key) => {
        if (typeof key === "string") {
          const month = monthOptions.find((option) => option.value === key)?.value;

          if (month) {
            onChange(month);
          }
        }
      }}
      selectedKey={value}
    >
      <Label className={placement === "header" ? "sr-only" : summaryStyles.filterLabel}>
        {label}
      </Label>
      <AriaButton className={summarySelectTriggerStyles({ placement })}>
        <CalendarBlankIcon className="text-brand" aria-hidden="true" />
        <SelectValue className={summaryStyles.selectValue} />
        <CaretDownIcon className="text-subtle" aria-hidden="true" />
      </AriaButton>
      <Popover className={summaryStyles.selectPopover}>
        <ListBox aria-label={label} className={summaryStyles.selectList}>
          {monthOptions.map((month) => (
            <ListBoxItem
              className={summaryStyles.selectOption}
              id={month.value}
              key={month.value}
              textValue={month.label}
            >
              {month.label}
            </ListBoxItem>
          ))}
        </ListBox>
      </Popover>
    </Select>
  );
}

function calculateCategoryShares(categories: CategoryExpense[]) {
  const largestAmount = Math.max(...categories.map((category) => category.amount), 0);

  return categories.map((category) => ({
    ...category,
    share: largestAmount > 0 ? Math.round((category.amount / largestAmount) * 100) : 0,
  }));
}

type SummaryPageProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  data: SummaryData;
};

function SummaryPage({ accounts, categories, data }: SummaryPageProps) {
  const search = summaryRoute.useSearch();
  const navigate = summaryRoute.useNavigate();
  const summary = data;
  const accountFilterItems = buildAccountFilterItems(accounts, demoAccountResources);
  const categoryFilterItems = buildCategoryFilterItems(categories, demoCategoryResources);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const wasFiltersOpenRef = useRef(false);
  const { control, handleSubmit, register, reset, setFocus, setValue } =
    useForm<SummaryFilterFormData>({
      defaultValues: {
        accounts: search.accounts,
        categories: search.categories,
        includePreviousBalance: search.includePreviousBalance,
        month: search.month,
        search: search.q,
      },
      resolver: zodResolver(summaryFilterSchema),
    });
  const appliedAccounts = search.accounts;
  const appliedCategories = search.categories;
  const selectedAccountIds = appliedAccounts.filter(
    (account) => account !== allAccountsFilterValue,
  );
  const selectedCategoryNames = getSelectedResourceNames(
    [...categories, ...demoCategoryResources],
    appliedCategories,
  );
  const selectedCategoryExpenseNames = new Set(
    Array.from(selectedCategoryNames, getCategoryExpenseName),
  );
  const selectedAccountIdSet = new Set(selectedAccountIds);
  const selectedCategoryIdSet = new Set(appliedCategories);
  const appliedSearchTerm = search.q;
  const includePreviousBalance = search.includePreviousBalance;
  const isLedgerExpanded = search.ledgerExpanded;
  const selectedAccounts = useWatch({ control, name: "accounts" }) ?? [];
  const selectedCategories = useWatch({ control, name: "categories" }) ?? [];
  const selectedIncludePreviousBalance =
    useWatch({ control, name: "includePreviousBalance" }) ?? search.includePreviousBalance;
  const selectedMonth = useWatch({ control, name: "month" }) ?? search.month;
  const searchField = register("search");
  const allAccountsSelected = appliedAccounts.includes(allAccountsFilterValue);
  const hasAccountFilter = appliedAccounts.length > 0 && !allAccountsSelected;
  const activeFilterCount =
    1 +
    Number(appliedSearchTerm.trim().length > 0) +
    Number(appliedCategories.length > 0) +
    Number(hasAccountFilter);
  const normalizedSearchTerm = appliedSearchTerm.trim().toLocaleLowerCase("pt-BR");
  const hasTransactionFilter = normalizedSearchTerm.length > 0 || hasAccountFilter;
  const hasCategoryFilter = appliedCategories.length > 0;
  const hasMovementFilter = hasTransactionFilter || hasCategoryFilter;
  const visibleMovements = summary.movements.filter((movement) => {
    const matchesSearch =
      normalizedSearchTerm.length === 0 ||
      [movement.description, movement.category, movement.account].some((value) =>
        value.toLocaleLowerCase("pt-BR").includes(normalizedSearchTerm),
      );
    const matchesCategory =
      appliedCategories.length === 0 || selectedCategoryIdSet.has(movement.categoryId);
    const matchesAccount =
      appliedAccounts.length === 0 ||
      allAccountsSelected ||
      selectedAccountIdSet.has(movement.accountId);

    return matchesSearch && matchesCategory && matchesAccount;
  });
  const visibleCategoryExpenses = hasMovementFilter
    ? calculateCategoryShares(
        summary.categoryExpenses
          .map((category) => {
            const amount = visibleMovements
              .filter(
                (movement) =>
                  movement.kind === "expense" &&
                  getCategoryExpenseName(movement.filterCategory) === category.name,
              )
              .reduce((total, movement) => total + movement.value, 0);

            return { ...category, amount };
          })
          .filter((category) => category.amount > 0),
      )
    : summary.categoryExpenses.filter(
        (category) =>
          appliedCategories.length === 0 || selectedCategoryExpenseNames.has(category.name),
      );
  const ledgerIncome = hasMovementFilter
    ? visibleMovements
        .filter((movement) => movement.kind === "income")
        .reduce((total, movement) => total + movement.value, 0)
    : summary.income;
  const ledgerExpenses = hasMovementFilter
    ? visibleMovements
        .filter((movement) => movement.kind === "expense")
        .reduce((total, movement) => total + movement.value, 0)
    : summary.expenses;
  const finalBalance =
    ledgerIncome - ledgerExpenses + (includePreviousBalance ? summary.previousBalance : 0);

  useEffect(() => {
    reset({
      accounts: search.accounts,
      categories: search.categories,
      includePreviousBalance: search.includePreviousBalance,
      month: search.month,
      search: search.q,
    });
  }, [
    reset,
    search.accounts,
    search.categories,
    search.includePreviousBalance,
    search.month,
    search.q,
  ]);

  useEffect(() => {
    if (isFiltersOpen) {
      setFocus("search");
    } else if (wasFiltersOpenRef.current) {
      filterTriggerRef.current?.focus();
    }
    wasFiltersOpenRef.current = isFiltersOpen;
  }, [isFiltersOpen, setFocus]);

  const handleAccountTreeSelectionChange = (nextAccounts: AccountFilterValue[]) => {
    const individualAccounts = nextAccounts.filter((account) => account !== allAccountsFilterValue);
    const hadAllAccountsSelected = selectedAccounts.includes(allAccountsFilterValue);
    const hasAllAccountsSelected = nextAccounts.includes(allAccountsFilterValue);

    const normalizedAccounts = hasAllAccountsSelected
      ? hadAllAccountsSelected
        ? individualAccounts.length > 0
          ? individualAccounts
          : [allAccountsFilterValue]
        : [allAccountsFilterValue]
      : individualAccounts;

    setValue("accounts", normalizedAccounts, { shouldDirty: true });
  };

  const handleClearFilters = () => {
    setValue("search", "", { shouldDirty: true });
    setValue("categories", [], { shouldDirty: true });
    setValue("accounts", [allAccountsFilterValue], { shouldDirty: true });
    void navigate({
      search: (current) => ({
        ...current,
        accounts: [allAccountsFilterValue],
        categories: [],
        q: "",
      }),
    });
  };

  const handleApplyFilters = (formData: SummaryFilterFormData) => {
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

  const handleHeaderMonthChange = (month: SummaryMonth) => {
    setValue("month", month, { shouldDirty: true });
    void navigate({
      search: (current) => ({
        ...current,
        month,
      }),
    });
  };

  const handleLedgerToggle = () => {
    void navigate({
      search: (current) => ({
        ...current,
        ledgerExpanded: !current.ledgerExpanded,
      }),
    });
  };

  const handleLedgerPreviousBalanceChange = (selected: boolean) => {
    void navigate({
      search: (current) => ({
        ...current,
        includePreviousBalance: selected,
      }),
    });
  };

  const handleCloseFilters = () => {
    setIsFiltersOpen(false);
  };

  return (
    <main className={summaryStyles.page} aria-labelledby="summary-title">
      <div className={summaryStyles.layout}>
        <Card
          as="aside"
          className={summaryFiltersStyles({ open: isFiltersOpen })}
          id="summary-filters"
          aria-label="Filtros do resumo"
        >
          <CardHeader>
            <div>
              <h2 className="m-0 text-title-compact">Filtros</h2>
              <p className={`${summaryStyles.filterCount} text-meta`}>
                {activeFilterCount} {activeFilterCount === 1 ? "ativo" : "ativos"}
              </p>
            </div>
            <Button
              className={summaryStyles.filterClose}
              variant="ghost"
              size="sm"
              isIconOnly
              aria-label="Fechar filtros"
              onPress={handleCloseFilters}
            >
              <XIcon aria-hidden="true" />
            </Button>
          </CardHeader>

          <form className={summaryStyles.filterForm} onSubmit={handleSubmit(handleApplyFilters)}>
            <CardBody className="gap-5.5">
              <AriaTextField className={summaryStyles.filterGroup}>
                <Label className={summaryStyles.filterLabel}>Buscar transação</Label>
                <div className={summaryStyles.filterControl}>
                  <MagnifyingGlassIcon aria-hidden="true" />
                  <Input
                    {...searchField}
                    id="summary-search"
                    className={summaryStyles.filterInput}
                    placeholder="Nome, descrição..."
                    type="search"
                  />
                </div>
              </AriaTextField>

              <fieldset className={`${summaryStyles.filterGroup} ${summaryStyles.filterFieldset}`}>
                <legend className={summaryStyles.filterLabel}>Categorias</legend>
                <FilterTree
                  ariaLabel="Categorias"
                  items={categoryFilterItems}
                  onSelectionChange={(selectedCategoryIds) =>
                    setValue("categories", selectedCategoryIds, { shouldDirty: true })
                  }
                  selectedKeys={selectedCategories}
                />
              </fieldset>

              <fieldset className={`${summaryStyles.filterGroup} ${summaryStyles.filterFieldset}`}>
                <legend className={summaryStyles.filterLabel}>Contas</legend>
                <FilterTree
                  ariaLabel="Contas"
                  items={accountFilterItems}
                  onSelectionChange={handleAccountTreeSelectionChange}
                  selectedKeys={selectedAccounts}
                />
              </fieldset>

              <div className={summaryStyles.filterGroup}>
                <SummaryMonthSelect
                  label="Mês"
                  onChange={(value) => setValue("month", value, { shouldDirty: true })}
                  placement="filter"
                  value={selectedMonth}
                />
                <SummaryCheckbox
                  isSelected={selectedIncludePreviousBalance}
                  onChange={(isSelected) =>
                    setValue("includePreviousBalance", isSelected, { shouldDirty: true })
                  }
                >
                  Incluir saldo anterior
                </SummaryCheckbox>
              </div>
            </CardBody>
            <CardFooter className="grid-cols-2 gap-2">
              <Button variant="secondary" size="sm" type="button" onPress={handleClearFilters}>
                Limpar
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Aplicar
              </Button>
            </CardFooter>
          </form>
        </Card>

        <div className={summaryStyles.main}>
          <header className={summaryStyles.pageHead}>
            <div>
              <h1 className="m-0 text-page-title" id="summary-title">
                {summary.monthLabel}
              </h1>
              <p className={summaryStyles.pageDescription}>Resumo financeiro do mês selecionado.</p>
            </div>
            <div className={summaryStyles.pageActions}>
              <SummaryMonthSelect
                label="Mês do resumo"
                onChange={handleHeaderMonthChange}
                placement="header"
                value={search.month}
              />
              <Button
                className={summaryStyles.filterTrigger}
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
            </div>
          </header>

          <section
            className={summaryStyles.activeFilters}
            aria-label="Filtros ativos"
            aria-live="polite"
          >
            <span className={`${summaryStyles.activeFilterLabel} text-meta`}>Filtros ativos</span>
            <div className={summaryStyles.filterChips}>
              <span className={summaryStyles.filterChip}>Mês: {summary.monthLabel}</span>
              {appliedCategories.length > 0 && (
                <span className={summaryStyles.filterChip}>
                  Categorias: {Array.from(selectedCategoryNames).join(", ")}
                </span>
              )}
              {hasAccountFilter && (
                <span className={summaryStyles.filterChip}>
                  {`${appliedAccounts.length} contas`}
                </span>
              )}
            </div>
          </section>

          <Card as="section" className="mb-4" aria-labelledby="ledger-title">
            <CardHeader className="items-center">
              <h2 className={summaryStyles.cardTitle} id="ledger-title">
                Entradas e saídas
              </h2>
              <div className={summaryStyles.ledgerTools}>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  aria-label={isLedgerExpanded ? "Recolher resumo" : "Expandir resumo"}
                  onPress={handleLedgerToggle}
                >
                  {isLedgerExpanded ? (
                    <MinusIcon aria-hidden="true" />
                  ) : (
                    <PlusIcon aria-hidden="true" />
                  )}
                </Button>
                <details className={summaryStyles.ledgerHelp}>
                  <summary
                    className={summaryStyles.ledgerHelpTrigger}
                    aria-label="Como o saldo final é calculado"
                  >
                    <InfoIcon aria-hidden="true" />
                  </summary>
                  <p className={summaryStyles.ledgerHelpCopy}>
                    O saldo final combina entradas, saídas e o saldo anterior quando essa opção está
                    ativa.
                  </p>
                </details>
              </div>
            </CardHeader>
            {isLedgerExpanded && (
              <CardBody className="gap-1.5">
                <SummaryCheckbox
                  isSelected={includePreviousBalance}
                  onChange={handleLedgerPreviousBalanceChange}
                  placement="ledger"
                >
                  Incluir saldo anterior
                </SummaryCheckbox>
                {includePreviousBalance && (
                  <div className={summaryStyles.ledgerRow}>
                    <span>Saldo anterior</span>
                    <strong className={summaryStyles.ledgerValue}>
                      {formatCurrency(summary.previousBalance)}
                    </strong>
                  </div>
                )}
                <div className={summaryStyles.ledgerRow}>
                  <span>Entradas</span>
                  <strong className={summaryStyles.ledgerValue}>
                    {formatCurrency(ledgerIncome)}
                  </strong>
                </div>
                <div className={summaryStyles.ledgerRow}>
                  <span>Saídas</span>
                  <strong className={`${summaryStyles.ledgerValue} ${summaryStyles.ledgerExpense}`}>
                    − {formatCurrency(ledgerExpenses)}
                  </strong>
                </div>
                <div className={summaryStyles.ledgerDivider} />
                <div className={summaryStyles.ledgerTotal}>
                  <span>Saldo final</span>
                  <strong className={summaryStyles.ledgerTotalValue}>
                    {formatCurrency(finalBalance)}
                  </strong>
                </div>
              </CardBody>
            )}
          </Card>

          <div className={summaryStyles.contentGrid}>
            <Card as="section" aria-labelledby="category-title">
              <CardHeader className="items-baseline">
                <h2 className={summaryStyles.cardTitle} id="category-title">
                  Despesas por categoria
                </h2>
                <span className={`${summaryStyles.cardPeriod} text-meta`}>
                  {summary.monthLabel}
                </span>
              </CardHeader>
              <CardBody>
                <ul className={summaryStyles.categoryChart} aria-label="Despesas por categoria">
                  {visibleCategoryExpenses.map((category) => (
                    <li className={summaryStyles.categoryRow} key={category.name}>
                      <div className={summaryStyles.categoryLabel}>
                        <span>{category.name}</span>
                        <strong className={summaryStyles.categoryValue}>
                          {formatCurrency(category.amount)}
                        </strong>
                      </div>
                      <div className={summaryStyles.categoryTrack} aria-hidden="true">
                        <span
                          className={summaryStyles.categoryBar}
                          style={getCategoryBarStyle(category.share)}
                        />
                      </div>
                    </li>
                  ))}
                  {visibleCategoryExpenses.length === 0 && (
                    <li className={summaryStyles.emptyState}>Nenhuma categoria selecionada.</li>
                  )}
                </ul>
              </CardBody>
            </Card>

            <Card as="section" aria-labelledby="movements-title">
              <CardHeader className="items-baseline">
                <h2 className={summaryStyles.cardTitle} id="movements-title">
                  Últimos movimentos
                </h2>
                <Link
                  className={summaryStyles.cardAction}
                  preload="intent"
                  to="/transactions"
                  variant="link"
                >
                  Ver todos
                </Link>
              </CardHeader>
              <CardBody>
                <ul className={summaryStyles.movementList}>
                  {visibleMovements.map((movement) => (
                    <li className={summaryStyles.movementItem} key={movement.description}>
                      <div className={summaryStyles.movementCopy}>
                        <Link
                          className={summaryStyles.movementPrimary}
                          preload="intent"
                          to="/transactions/$transactionId"
                          params={{ transactionId: movement.id }}
                          variant="link"
                        >
                          {movement.description}
                        </Link>
                        <span className={summaryStyles.movementSecondary}>
                          {movement.category} · {movement.account}
                        </span>
                      </div>
                      <span className={summaryStatusStyles({ kind: movement.kind })}>
                        {formatSignedCurrency(
                          movement.kind === "expense" ? -movement.value : movement.value,
                        )}
                      </span>
                    </li>
                  ))}
                  {visibleMovements.length === 0 && (
                    <li className={summaryStyles.emptyState}>
                      Nenhum movimento encontrado com esses filtros.
                    </li>
                  )}
                </ul>
              </CardBody>
            </Card>
          </div>

          <p className={summaryStyles.demoNote}>Dados demonstrativos para composição da tela.</p>
        </div>
      </div>
    </main>
  );
}

export const Route = createFileRoute("/_private/summary")({
  validateSearch: summarySearchSchema,
  loaderDeps: ({ search }) => ({ month: search.month }),
  loader: async ({ abortController, deps }) => {
    const [summary, categories, accounts] = await Promise.all([
      getSummaryData(deps.month),
      getCategorias({ signal: abortController.signal }),
      getContas({ signal: abortController.signal }),
    ]);

    if (!summary) {
      throw notFound();
    }

    return { accounts, categories, summary };
  },
  component: SummaryPageRoute,
  preloadStaleTime: 30_000,
});

function SummaryPageRoute() {
  const { accounts, categories, summary } = Route.useLoaderData();

  return <SummaryPage accounts={accounts} categories={categories} data={summary} />;
}
