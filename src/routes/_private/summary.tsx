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
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { getRouteApi } from "@tanstack/react-router";
import { tv } from "tailwind-variants";
import { z } from "zod";

import { Button } from "../../components/Button";
import { Card, CardHeader, CardBody, CardFooter } from "../../components/Card";
import { Checkbox } from "../../components/Checkbox";
import { FilterTree, type FilterTreeItem } from "../../components/FilterTree";
import { Link } from "../../components/Link";
import { buildCategoryTree, type CategoryTreeNode } from "../../lib/category-tree";
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

const summaryFiltersStyles = tv({
  base: "sticky top-6 w-auto self-start m-[1.5rem_0_1.5rem_1.5rem] max-h-[calc(100svh-3rem)] overflow-auto max-[48rem]:static max-[48rem]:m-[0_1rem_1rem] max-[48rem]:max-h-none max-[48rem]:hidden",
  variants: {
    open: {
      false: "",
      true: "max-[48rem]:!grid",
    },
  },
});

const summarySelectTriggerStyles = tv({
  base: "flex min-w-0 cursor-pointer items-center gap-2 border border-border text-muted transition-[background-color,border-color] duration-150 ease-out motion-reduce:transition-none hover:border-border-strong hover:bg-surface-muted focus-visible:border-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&>svg]:size-4 [&>svg]:shrink-0",
  variants: {
    placement: {
      filter:
        "min-h-[2.625rem] w-full rounded-xl bg-[color-mix(in_oklch,var(--color-surface)_70%,transparent)] px-3",
      header:
        "min-h-[2.625rem] rounded-full bg-[color-mix(in_oklch,var(--color-surface)_68%,transparent)] px-3.5 text-caption-strong max-[48rem]:flex-1 max-[48rem]:justify-center",
    },
  },
});

const summaryStatusStyles = tv({
  base: "inline-flex flex-none items-center rounded-full border px-2 py-1 text-caption-strong tabular-nums whitespace-nowrap",
  variants: {
    kind: {
      income:
        "border-[color-mix(in_oklch,var(--color-success)_24%,var(--color-border))] bg-success-soft text-success",
      expense:
        "border-[color-mix(in_oklch,var(--color-danger)_24%,var(--color-border))] bg-danger-soft text-danger",
    },
  },
});

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

function toFilterTreeItem(category: CategoryTreeNode<CategoryResource>): FilterTreeItem {
  return {
    ...(category.children.length > 0 ? { children: category.children.map(toFilterTreeItem) } : {}),
    id: category.id,
    label: category.nome,
  };
}

function buildCategoryTreeItems(
  categories: readonly CategoryResource[],
): readonly FilterTreeItem[] {
  return buildCategoryTree(categories).map(toFilterTreeItem);
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
      className="min-w-0"
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
      <Label
        className={
          placement === "header"
            ? "sr-only"
            : "m-0 text-caption-strong tracking-[0.04em] text-muted uppercase"
        }
      >
        {label}
      </Label>
      <AriaButton className={summarySelectTriggerStyles({ placement })}>
        <CalendarBlankIcon className="text-brand" aria-hidden="true" />
        <SelectValue className="min-w-0 flex-1 truncate" />
        <CaretDownIcon className="text-subtle" aria-hidden="true" />
      </AriaButton>
      <Popover className="z-10 min-w-48 overflow-hidden rounded-xl border border-border bg-surface p-1 shadow-popover">
        <ListBox
          aria-label={label}
          className="grid max-h-60 gap-0.5 overflow-auto p-0 outline-none"
        >
          {monthOptions.map((month) => (
            <ListBoxItem
              className="cursor-pointer rounded-lg px-3 py-2 text-body-small text-foreground outline-none data-focused:bg-surface-muted data-selected:bg-brand-soft data-selected:text-brand-hover"
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
    const availableCategoryIds = new Set([
      ...categories.map((category) => category.id),
      ...demoCategoryResources.map((category) => category.id),
    ]);
    const normalizedCategories = search.categories.filter((categoryId) =>
      availableCategoryIds.has(categoryId),
    );

    if (normalizedCategories.length === search.categories.length) {
      return;
    }

    void navigate({
      replace: true,
      search: (current) => ({
        ...current,
        categories: normalizedCategories,
      }),
    });
  }, [categories, navigate, search.categories]);

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
    <section className="min-w-0" aria-labelledby="summary-title">
      <div className="grid min-w-0 grid-cols-[18.25rem_minmax(0,1fr)] items-start max-[48rem]:block">
        <Card
          as="aside"
          className={summaryFiltersStyles({ open: isFiltersOpen })}
          id="summary-filters"
          aria-label="Filtros do resumo"
        >
          <CardHeader>
            <div>
              <h2 className="m-0 text-title-compact">Filtros</h2>
              <p className="m-0 text-meta text-subtle">
                {activeFilterCount} {activeFilterCount === 1 ? "ativo" : "ativos"}
              </p>
            </div>
            <Button
              className="hidden! max-[48rem]:inline-flex!"
              variant="ghost"
              size="sm"
              isIconOnly
              aria-label="Fechar filtros"
              onPress={handleCloseFilters}
            >
              <XIcon aria-hidden="true" />
            </Button>
          </CardHeader>

          <form className="grid gap-5.5" onSubmit={handleSubmit(handleApplyFilters)}>
            <CardBody className="gap-5.5">
              <AriaTextField className="grid gap-2.5">
                <Label className="m-0 text-caption-strong tracking-[0.04em] text-muted uppercase">
                  Buscar transação
                </Label>
                <div className="flex min-h-10.5 min-w-0 items-center gap-2.5 rounded-xl border border-border bg-[color-mix(in_oklch,var(--color-surface)_70%,transparent)] px-3 text-subtle transition-[background-color,border-color] duration-150 ease-out focus-within:border-brand focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand hover:border-border-strong hover:bg-surface-muted motion-reduce:transition-none [&>svg]:size-4 [&>svg]:shrink-0">
                  <MagnifyingGlassIcon aria-hidden="true" />
                  <Input
                    {...searchField}
                    id="summary-search"
                    className="min-w-0 flex-1 border-0 bg-transparent text-body-small text-foreground caret-brand outline-none placeholder:text-subtle"
                    placeholder="Nome, descrição..."
                    type="search"
                  />
                </div>
              </AriaTextField>

              <fieldset className="grid min-w-0 gap-2.5 border-0 p-0">
                <legend className="m-0 flex items-center justify-between gap-2 text-caption-strong tracking-[0.04em] text-muted uppercase">
                  <span>Categorias</span>
                  <Link
                    aria-label="Gerenciar categorias"
                    className="size-8! min-h-8! rounded-lg!"
                    isIconOnly
                    preload="intent"
                    size="sm"
                    to="/categories"
                    variant="ghost"
                  >
                    <GearSixIcon aria-hidden="true" />
                  </Link>
                </legend>
                <FilterTree
                  ariaLabel="Categorias"
                  items={categoryFilterItems}
                  onSelectionChange={(selectedCategoryIds) =>
                    setValue("categories", selectedCategoryIds, { shouldDirty: true })
                  }
                  selectedKeys={selectedCategories}
                />
              </fieldset>

              <fieldset className="grid min-w-0 gap-2.5 border-0 p-0">
                <legend className="m-0 text-caption-strong tracking-[0.04em] text-muted uppercase">
                  Contas
                </legend>
                <FilterTree
                  ariaLabel="Contas"
                  items={accountFilterItems}
                  onSelectionChange={handleAccountTreeSelectionChange}
                  selectedKeys={selectedAccounts}
                />
              </fieldset>

              <div className="grid gap-2.5">
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

        <div className="min-w-0 p-[2rem_1.75rem_2.5rem] max-[48rem]:p-[1.5rem_1rem_2rem]">
          <header className="mb-5.5 flex items-end justify-between gap-4 max-[48rem]:mb-4 max-[48rem]:grid max-[48rem]:items-start max-[48rem]:gap-4">
            <div>
              <h1 className="m-0 text-page-title" id="summary-title">
                {summary.monthLabel}
              </h1>
              <p className="m-0 mt-2.5 text-body-small text-muted">
                Resumo financeiro do mês selecionado.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <SummaryMonthSelect
                label="Mês do resumo"
                onChange={handleHeaderMonthChange}
                placement="header"
                value={search.month}
              />
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
            </div>
          </header>

          <section
            className="mb-3.5 hidden gap-2.5 max-[48rem]:grid"
            aria-label="Filtros ativos"
            aria-live="polite"
          >
            <span className="text-meta text-subtle uppercase">Filtros ativos</span>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full border border-border bg-[color-mix(in_oklch,var(--color-surface)_60%,transparent)] px-2.5 py-1.5 text-caption text-muted">
                Mês: {summary.monthLabel}
              </span>
              {appliedCategories.length > 0 && (
                <span className="rounded-full border border-border bg-[color-mix(in_oklch,var(--color-surface)_60%,transparent)] px-2.5 py-1.5 text-caption text-muted">
                  Categorias: {Array.from(selectedCategoryNames).join(", ")}
                </span>
              )}
              {hasAccountFilter && (
                <span className="rounded-full border border-border bg-[color-mix(in_oklch,var(--color-surface)_60%,transparent)] px-2.5 py-1.5 text-caption text-muted">
                  {`${appliedAccounts.length} contas`}
                </span>
              )}
            </div>
          </section>

          <Card as="section" className="mb-4" aria-labelledby="ledger-title">
            <CardHeader className="items-center">
              <h2 className="m-0 text-title-compact text-foreground" id="ledger-title">
                Entradas e saídas
              </h2>
              <div className="flex items-center gap-1">
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
                <details className="relative">
                  <summary
                    className="grid size-9 cursor-pointer list-none place-items-center rounded-lg text-subtle hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand [&::-webkit-details-marker]:hidden [&>svg]:size-4.5"
                    aria-label="Como o saldo final é calculado"
                  >
                    <InfoIcon aria-hidden="true" />
                  </summary>
                  <p className="absolute top-[calc(100%+0.5rem)] right-0 z-2 m-0 w-[min(16rem,70vw)] rounded-xl border border-border bg-surface p-3 text-caption text-muted shadow-popover">
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
                  <div className="flex min-h-8 items-center justify-between gap-4 text-body-small text-muted max-[28rem]:gap-3">
                    <span>Saldo anterior</span>
                    <strong className="font-semibold whitespace-nowrap text-subtle tabular-nums">
                      {formatCurrency(summary.previousBalance)}
                    </strong>
                  </div>
                )}
                <div className="flex min-h-8 items-center justify-between gap-4 text-body-small text-muted max-[28rem]:gap-3">
                  <span>Entradas</span>
                  <strong className="font-semibold whitespace-nowrap text-subtle tabular-nums">
                    {formatCurrency(ledgerIncome)}
                  </strong>
                </div>
                <div className="flex min-h-8 items-center justify-between gap-4 text-body-small text-muted max-[28rem]:gap-3">
                  <span>Saídas</span>
                  <strong className="whitespace-nowrap text-danger tabular-nums">
                    − {formatCurrency(ledgerExpenses)}
                  </strong>
                </div>
                <div className="my-1.5 mb-2 h-px bg-border-strong" />
                <div className="flex items-baseline justify-between gap-4 text-caption text-muted max-[28rem]:gap-3">
                  <span>Saldo final</span>
                  <strong className="text-metric whitespace-nowrap text-foreground tabular-nums">
                    {formatCurrency(finalBalance)}
                  </strong>
                </div>
              </CardBody>
            )}
          </Card>

          <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(18rem,0.95fr)] gap-4 max-[48rem]:grid-cols-1">
            <Card as="section" aria-labelledby="category-title">
              <CardHeader className="items-baseline">
                <h2 className="m-0 text-title-compact text-foreground" id="category-title">
                  Despesas por categoria
                </h2>
                <span className="text-meta text-subtle">{summary.monthLabel}</span>
              </CardHeader>
              <CardBody>
                <ul className="m-0 grid list-none gap-3.5 p-0" aria-label="Despesas por categoria">
                  {visibleCategoryExpenses.map((category) => (
                    <li className="grid gap-1.75" key={category.name}>
                      <div className="flex items-center justify-between gap-4 text-caption text-muted">
                        <span>{category.name}</span>
                        <strong className="font-semibold whitespace-nowrap text-subtle tabular-nums">
                          {formatCurrency(category.amount)}
                        </strong>
                      </div>
                      <div
                        className="h-2.25 overflow-hidden rounded-full bg-surface-muted"
                        aria-hidden="true"
                      >
                        <span
                          className="block h-full w-(--category-share) rounded-[inherit] bg-brand"
                          style={getCategoryBarStyle(category.share)}
                        />
                      </div>
                    </li>
                  ))}
                  {visibleCategoryExpenses.length === 0 && (
                    <li className="rounded-xl border border-dashed border-border-strong p-3.5 text-caption text-muted">
                      Nenhuma categoria selecionada.
                    </li>
                  )}
                </ul>
              </CardBody>
            </Card>

            <Card as="section" aria-labelledby="movements-title">
              <CardHeader className="items-baseline">
                <h2 className="m-0 text-title-compact text-foreground" id="movements-title">
                  Últimos movimentos
                </h2>
                <Link className="text-caption" preload="intent" to="/transactions" variant="link">
                  Ver todos
                </Link>
              </CardHeader>
              <CardBody>
                <ul className="m-0 grid list-none gap-2.5 p-0">
                  {visibleMovements.map((movement) => (
                    <li
                      className="flex min-w-0 items-center justify-between gap-4 rounded-[0.875rem] border border-border bg-[color-mix(in_oklch,var(--color-surface)_48%,transparent)] px-3 py-2.75 max-[28rem]:flex-col max-[28rem]:items-start"
                      key={movement.description}
                    >
                      <div className="min-w-0">
                        <span className="block truncate text-caption-strong text-foreground">
                          {movement.description}
                        </span>
                        <span className="mt-0.75 block truncate text-caption text-subtle">
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
                    <li className="rounded-xl border border-dashed border-border-strong p-3.5 text-caption text-muted">
                      Nenhum movimento encontrado com esses filtros.
                    </li>
                  )}
                </ul>
              </CardBody>
            </Card>
          </div>

          <p className="m-0 mt-4 text-caption text-subtle">
            Dados demonstrativos para composição da tela.
          </p>
        </div>
      </div>
    </section>
  );
}

export const Route = createFileRoute("/_private/summary")({
  validateSearch: summarySearchSchema,
  loaderDeps: ({ search }) => ({ month: search.month }),
  loader: async ({ abortController, deps }) => {
    const [summary, categories, accounts] = await Promise.all([
      getSummaryData(deps.month),
      getCategorias({ ativo: true, signal: abortController.signal }),
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
