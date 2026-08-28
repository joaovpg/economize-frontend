import { type CSSProperties, type ReactNode, useEffect, useRef, useState } from "react";
import {
  Button as AriaButton,
  Checkbox,
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
import { CheckIcon } from "@phosphor-icons/react/dist/csr/Check";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { InfoIcon } from "@phosphor-icons/react/dist/csr/Info";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { MinusIcon } from "@phosphor-icons/react/dist/csr/Minus";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { z } from "zod";

import { Button } from "../components/Button";
import { Link } from "../components/Link";
import {
  summaryCheckboxIndicatorStyles,
  summaryCheckboxStyles,
  summaryFiltersStyles,
  summarySelectTriggerStyles,
  summaryStatusStyles,
  summaryStyles,
} from "./summaryStyles";

type Movement = {
  account: string;
  category: string;
  description: string;
  filterCategory: string;
  kind: "income" | "expense";
  value: number;
};

type CategoryExpense = {
  amount: number;
  name: string;
  share: number;
};

type SummaryData = {
  categoryExpenses: CategoryExpense[];
  income: number;
  monthLabel: string;
  movements: Movement[];
  previousBalance: number;
  expenses: number;
};

type CategoryBarStyle = CSSProperties & {
  "--category-share": string;
};

const summaryByMonth: Record<string, SummaryData> = {
  "2026-08": {
    monthLabel: "Agosto 2026",
    previousBalance: 1240,
    income: 7850,
    expenses: 5420,
    categoryExpenses: [
      { name: "Moradia", amount: 1950, share: 88 },
      { name: "Mercado", amount: 1120, share: 62 },
      { name: "Transporte", amount: 720, share: 42 },
      { name: "Lazer", amount: 480, share: 35 },
    ],
    movements: [
      {
        description: "Aluguel",
        category: "Moradia",
        filterCategory: "Moradia",
        account: "Nubank",
        kind: "expense",
        value: 1850,
      },
      {
        description: "Salário",
        category: "Receita",
        filterCategory: "Receita",
        account: "Banco Inter",
        kind: "income",
        value: 7500,
      },
      {
        description: "Mercado",
        category: "Alimentação",
        filterCategory: "Mercado",
        account: "C6 Crédito",
        kind: "expense",
        value: 312.4,
      },
    ],
  },
  "2026-07": {
    monthLabel: "Julho 2026",
    previousBalance: 980,
    income: 7200,
    expenses: 4890,
    categoryExpenses: [
      { name: "Moradia", amount: 1850, share: 86 },
      { name: "Mercado", amount: 980, share: 58 },
      { name: "Transporte", amount: 680, share: 40 },
      { name: "Lazer", amount: 390, share: 31 },
    ],
    movements: [
      {
        description: "Aluguel",
        category: "Moradia",
        filterCategory: "Moradia",
        account: "Nubank",
        kind: "expense",
        value: 1850,
      },
      {
        description: "Salário",
        category: "Receita",
        filterCategory: "Receita",
        account: "Banco Inter",
        kind: "income",
        value: 7200,
      },
      {
        description: "Supermercado",
        category: "Alimentação",
        filterCategory: "Mercado",
        account: "C6 Crédito",
        kind: "expense",
        value: 286.7,
      },
    ],
  },
};

const categoryOptions = ["Moradia", "Mercado", "Transporte", "Lazer"];
const accountOptions = ["Nubank", "Banco Inter", "C6 Crédito"];
const defaultCategories: string[] = [];
const defaultAccounts = ["Todas as contas"];
const monthOptions = Object.entries(summaryByMonth).map(([value, data]) => ({
  label: data.monthLabel,
  value,
}));

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  currency: "BRL",
  minimumFractionDigits: 2,
  style: "currency",
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatSignedCurrency(value: number) {
  return value >= 0 ? `+ ${formatCurrency(value)}` : `− ${formatCurrency(Math.abs(value))}`;
}

function getCategoryBarStyle(share: number): CategoryBarStyle {
  return { "--category-share": `${share}%` };
}

const summaryFilterSchema = z.object({
  accounts: z.array(z.string()),
  categories: z.array(z.string()),
  includePreviousBalance: z.boolean(),
  month: z.string(),
  search: z.string(),
});

type SummaryFilterFormData = z.infer<typeof summaryFilterSchema>;

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
      className={summaryCheckboxStyles({ placement })}
      isSelected={isSelected}
      onChange={onChange}
    >
      {({ isIndeterminate, isSelected: selected }) => {
        const isChecked = selected || isIndeterminate;

        return (
          <>
            <span className={summaryCheckboxIndicatorStyles({ selected: isChecked })}>
              {isIndeterminate ? (
                <MinusIcon aria-hidden="true" weight="bold" />
              ) : isChecked ? (
                <CheckIcon aria-hidden="true" weight="bold" />
              ) : null}
            </span>
            <span>{children}</span>
          </>
        );
      }}
    </Checkbox>
  );
}

type SummaryMonthSelectProps = {
  label: string;
  onChange: (value: string) => void;
  placement: "filter" | "header";
  value: string;
};

function SummaryMonthSelect({ label, onChange, placement, value }: SummaryMonthSelectProps) {
  return (
    <Select
      aria-label={label}
      className={summaryStyles.selectRoot}
      onSelectionChange={(key) => {
        if (typeof key === "string") {
          onChange(key);
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

function SummaryPage() {
  const [appliedAccounts, setAppliedAccounts] = useState(defaultAccounts);
  const [appliedCategories, setAppliedCategories] = useState(defaultCategories);
  const [appliedSearchTerm, setAppliedSearchTerm] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isLedgerExpanded, setIsLedgerExpanded] = useState(true);
  const filterTriggerRef = useRef<HTMLButtonElement>(null);
  const wasFiltersOpenRef = useRef(false);
  const { control, handleSubmit, register, setFocus, setValue } = useForm<SummaryFilterFormData>({
    defaultValues: {
      accounts: defaultAccounts,
      categories: defaultCategories,
      includePreviousBalance: true,
      month: "2026-08",
      search: "",
    },
    resolver: zodResolver(summaryFilterSchema),
  });
  const selectedAccounts = useWatch({ control, name: "accounts" }) ?? [];
  const selectedCategories = useWatch({ control, name: "categories" }) ?? [];
  const selectedMonth = useWatch({ control, name: "month" }) ?? "2026-08";
  const includePreviousBalance = useWatch({ control, name: "includePreviousBalance" }) ?? true;
  const searchField = register("search");
  const summary = summaryByMonth[selectedMonth];
  const activeFilterCount =
    1 +
    Number(appliedSearchTerm.trim().length > 0) +
    Number(appliedCategories.length > 0) +
    Number(appliedAccounts.length > 0);
  const allCategoriesSelected = selectedCategories.length === categoryOptions.length;
  const someCategoriesSelected = selectedCategories.length > 0 && !allCategoriesSelected;
  const normalizedSearchTerm = appliedSearchTerm.trim().toLocaleLowerCase("pt-BR");
  const allAccountsSelected = appliedAccounts.includes("Todas as contas");
  const hasTransactionFilter =
    normalizedSearchTerm.length > 0 || appliedAccounts.length === 0 || !allAccountsSelected;
  const hasCategoryFilter = appliedCategories.length > 0;
  const hasMovementFilter = hasTransactionFilter || hasCategoryFilter;
  const visibleMovements = summary.movements.filter((movement) => {
    const matchesSearch =
      normalizedSearchTerm.length === 0 ||
      [movement.description, movement.category, movement.account].some((value) =>
        value.toLocaleLowerCase("pt-BR").includes(normalizedSearchTerm),
      );
    const matchesCategory =
      appliedCategories.length === 0 || appliedCategories.includes(movement.filterCategory);
    const matchesAccount =
      appliedAccounts.length === 0 ||
      allAccountsSelected ||
      appliedAccounts.includes(movement.account);

    return matchesSearch && matchesCategory && matchesAccount;
  });
  const visibleCategoryExpenses = hasMovementFilter
    ? calculateCategoryShares(
        summary.categoryExpenses
          .map((category) => {
            const amount = visibleMovements
              .filter(
                (movement) =>
                  movement.kind === "expense" && movement.filterCategory === category.name,
              )
              .reduce((total, movement) => total + movement.value, 0);

            return { ...category, amount };
          })
          .filter((category) => category.amount > 0),
      )
    : summary.categoryExpenses.filter(
        (category) => appliedCategories.length === 0 || appliedCategories.includes(category.name),
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
    if (isFiltersOpen) {
      setFocus("search");
    } else if (wasFiltersOpenRef.current) {
      filterTriggerRef.current?.focus();
    }
    wasFiltersOpenRef.current = isFiltersOpen;
  }, [isFiltersOpen, setFocus]);

  const toggleCategory = (category: string) => {
    const nextCategories = selectedCategories.includes(category)
      ? selectedCategories.filter((item) => item !== category)
      : [...selectedCategories, category];

    setValue("categories", nextCategories, { shouldDirty: true });
  };

  const toggleAccount = (account: string) => {
    if (account === "Todas as contas") {
      setValue("accounts", selectedAccounts.includes(account) ? [] : [account], {
        shouldDirty: true,
      });
      return;
    }

    const withoutAll = selectedAccounts.filter((item) => item !== "Todas as contas");
    const nextAccounts = withoutAll.includes(account)
      ? withoutAll.filter((item) => item !== account)
      : [...withoutAll, account];

    setValue("accounts", nextAccounts, { shouldDirty: true });
  };

  const handleClearFilters = () => {
    setValue("search", "", { shouldDirty: true });
    setValue("categories", [], { shouldDirty: true });
    setValue("accounts", [], { shouldDirty: true });
    setAppliedSearchTerm("");
    setAppliedCategories([]);
    setAppliedAccounts([]);
  };

  const handleApplyFilters = (data: SummaryFilterFormData) => {
    setAppliedSearchTerm(data.search);
    setAppliedCategories(data.categories);
    setAppliedAccounts(data.accounts);
    setIsFiltersOpen(false);
  };

  const handleCloseFilters = () => {
    setIsFiltersOpen(false);
  };

  return (
    <main className={summaryStyles.page} aria-labelledby="summary-title">
      <div className={summaryStyles.layout}>
        <aside
          className={summaryFiltersStyles({ open: isFiltersOpen })}
          id="summary-filters"
          aria-label="Filtros do resumo"
        >
          <div className={summaryStyles.filtersHeader}>
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
          </div>

          <form className={summaryStyles.filterForm} onSubmit={handleSubmit(handleApplyFilters)}>
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
              <div className={summaryStyles.filterTree}>
                <div className={`${summaryStyles.filterOption} ${summaryStyles.filterOptionGroup}`}>
                  <span
                    className={summaryStyles.filterBox}
                    data-partial={someCategoriesSelected || undefined}
                  >
                    {allCategoriesSelected ? (
                      <CheckIcon aria-hidden="true" weight="bold" />
                    ) : someCategoriesSelected ? (
                      <MinusIcon aria-hidden="true" weight="bold" />
                    ) : null}
                  </span>
                  <span>Despesas</span>
                  <CaretDownIcon className={summaryStyles.filterCaret} aria-hidden="true" />
                </div>
                <div className={summaryStyles.filterChildren}>
                  {categoryOptions.map((category) => (
                    <SummaryCheckbox
                      key={category}
                      isSelected={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    >
                      {category}
                    </SummaryCheckbox>
                  ))}
                </div>
                <div className={`${summaryStyles.filterOption} ${summaryStyles.filterOptionGroup}`}>
                  <span className={summaryStyles.filterBox} />
                  <span>Receitas</span>
                  <CaretDownIcon className={summaryStyles.filterCaret} aria-hidden="true" />
                </div>
              </div>
            </fieldset>

            <fieldset className={`${summaryStyles.filterGroup} ${summaryStyles.filterFieldset}`}>
              <legend className={summaryStyles.filterLabel}>Contas</legend>
              <div className={summaryStyles.filterTree}>
                <SummaryCheckbox
                  isSelected={selectedAccounts.includes("Todas as contas")}
                  onChange={() => toggleAccount("Todas as contas")}
                >
                  Todas as contas
                </SummaryCheckbox>
                <div className={`${summaryStyles.filterOption} ${summaryStyles.filterOptionGroup}`}>
                  <span className={summaryStyles.filterBox} />
                  <span>Bancos</span>
                  <CaretDownIcon className={summaryStyles.filterCaret} aria-hidden="true" />
                </div>
                <div className={summaryStyles.filterChildren}>
                  {accountOptions.slice(0, 2).map((account) => (
                    <SummaryCheckbox
                      key={account}
                      isSelected={selectedAccounts.includes(account)}
                      onChange={() => toggleAccount(account)}
                    >
                      {account}
                    </SummaryCheckbox>
                  ))}
                </div>
                <div className={`${summaryStyles.filterOption} ${summaryStyles.filterOptionGroup}`}>
                  <span className={summaryStyles.filterBox} />
                  <span>Cartões</span>
                  <CaretDownIcon className={summaryStyles.filterCaret} aria-hidden="true" />
                </div>
                <div className={summaryStyles.filterChildren}>
                  <SummaryCheckbox
                    isSelected={selectedAccounts.includes(accountOptions[2])}
                    onChange={() => toggleAccount(accountOptions[2])}
                  >
                    {accountOptions[2]}
                  </SummaryCheckbox>
                </div>
              </div>
            </fieldset>

            <div className={summaryStyles.filterGroup}>
              <SummaryMonthSelect
                label="Mês"
                onChange={(value) => setValue("month", value, { shouldDirty: true })}
                placement="filter"
                value={selectedMonth}
              />
              <SummaryCheckbox
                isSelected={includePreviousBalance}
                onChange={(isSelected) =>
                  setValue("includePreviousBalance", isSelected, { shouldDirty: true })
                }
              >
                Incluir saldo anterior
              </SummaryCheckbox>
            </div>

            <div className={summaryStyles.filterFooter}>
              <Button variant="secondary" size="sm" type="button" onPress={handleClearFilters}>
                Limpar
              </Button>
              <Button variant="primary" size="sm" type="submit">
                Aplicar
              </Button>
            </div>
          </form>
        </aside>

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
                onChange={(value) => setValue("month", value, { shouldDirty: true })}
                placement="header"
                value={selectedMonth}
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
                  Categorias: {appliedCategories.join(", ")}
                </span>
              )}
              {appliedAccounts.length > 0 && (
                <span className={summaryStyles.filterChip}>
                  {appliedAccounts.includes("Todas as contas")
                    ? "Todas as contas"
                    : `${appliedAccounts.length} contas`}
                </span>
              )}
            </div>
          </section>

          <section className={summaryStyles.ledgerCard} aria-labelledby="ledger-title">
            <header className={summaryStyles.ledgerHeader}>
              <h2 className={summaryStyles.cardTitle} id="ledger-title">
                Entradas e saídas
              </h2>
              <div className={summaryStyles.ledgerTools}>
                <Button
                  variant="ghost"
                  size="sm"
                  isIconOnly
                  aria-label={isLedgerExpanded ? "Recolher resumo" : "Expandir resumo"}
                  onPress={() => setIsLedgerExpanded((expanded) => !expanded)}
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
            </header>
            {isLedgerExpanded && (
              <div className={summaryStyles.ledgerBody}>
                <SummaryCheckbox
                  isSelected={includePreviousBalance}
                  onChange={(isSelected) =>
                    setValue("includePreviousBalance", isSelected, { shouldDirty: true })
                  }
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
              </div>
            )}
          </section>

          <div className={summaryStyles.contentGrid}>
            <section className={summaryStyles.card} aria-labelledby="category-title">
              <div className={summaryStyles.cardHeading}>
                <h2 className={summaryStyles.cardTitle} id="category-title">
                  Despesas por categoria
                </h2>
                <span className={`${summaryStyles.cardPeriod} text-meta`}>
                  {summary.monthLabel}
                </span>
              </div>
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
            </section>

            <section className={summaryStyles.card} aria-labelledby="movements-title">
              <div className={summaryStyles.cardHeading}>
                <h2 className={summaryStyles.cardTitle} id="movements-title">
                  Últimos movimentos
                </h2>
                <Link className={summaryStyles.cardAction} href="/transactions" variant="link">
                  Ver todos
                </Link>
              </div>
              <ul className={summaryStyles.movementList}>
                {visibleMovements.map((movement) => (
                  <li className={summaryStyles.movementItem} key={movement.description}>
                    <div className={summaryStyles.movementCopy}>
                      <strong className={summaryStyles.movementPrimary}>
                        {movement.description}
                      </strong>
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
            </section>
          </div>

          <p className={summaryStyles.demoNote}>Dados demonstrativos para composição da tela.</p>
        </div>
      </div>
    </main>
  );
}

export default SummaryPage;
