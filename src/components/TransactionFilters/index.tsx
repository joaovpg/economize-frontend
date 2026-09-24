import { type ReactNode, useEffect } from "react";
import { Input, TextField as AriaTextField } from "react-aria-components";
import { useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";
import { tv } from "tailwind-variants";

import { buildCategoryTree, type CategoryTreeNode } from "../../lib/category-tree";
import {
  allAccountsFilterValue,
  type AccountFilterValue,
  type TransactionFilterFormData,
  type TransactionFilterState,
  transactionFilterFormSchema,
} from "../../lib/transaction-filters";
import { parseTransactionMonth, toYearMonth } from "../../lib/transaction-month";
import { type ContaResponse } from "../../services/accounts/contracts";
import { type CategoriaResponse } from "../../services/categories/contracts";
import { Button } from "../Button";
import { Card, CardBody, CardFooter, CardHeader } from "../Card";
import { Checkbox } from "../Checkbox";
import { FilterTree, type FilterTreeItem } from "../FilterTree";
import { Label } from "../Label";
import { Link } from "../Link";
import { MonthYearFilter } from "../MonthYearFilter";

const filtersStyles = tv({
  base: "sticky top-6 w-auto self-start m-[1.5rem_0_1.5rem_1.5rem] max-h-[calc(100svh-3rem)] overflow-auto max-[48rem]:static max-[48rem]:m-[0_1rem_1rem] max-[48rem]:max-h-none max-[48rem]:hidden",
  variants: {
    open: {
      false: "",
      true: "max-[48rem]:!grid",
    },
  },
});

type CategoryResource = Pick<CategoriaResponse, "id" | "nome" | "categoriaPaiId">;

function toFilterTreeItem(category: CategoryTreeNode<CategoryResource>): FilterTreeItem {
  return {
    ...(category.children.length > 0 ? { children: category.children.map(toFilterTreeItem) } : {}),
    id: category.id,
    label: category.nome,
  };
}

function buildCategoryFilterItems(
  categories: readonly CategoriaResponse[],
): readonly FilterTreeItem[] {
  return buildCategoryTree(categories).map(toFilterTreeItem);
}

const inactiveAccountsGroupId = "contas-inativas";

function buildAccountFilterItems(accounts: readonly ContaResponse[]): readonly FilterTreeItem[] {
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

  return items;
}

function toFormValues(value: TransactionFilterState): TransactionFilterFormData {
  return {
    accounts: [...value.accounts],
    categories: [...value.categories],
    includePreviousBalance: value.includePreviousBalance,
    month: value.month,
    search: value.q,
  };
}

type TransactionFilterCheckboxProps = {
  children: ReactNode;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
};

function TransactionFilterCheckbox({
  children,
  isSelected,
  onChange,
}: TransactionFilterCheckboxProps) {
  return (
    <Checkbox isSelected={isSelected} onChange={onChange}>
      {children}
    </Checkbox>
  );
}

export type TransactionFiltersProps = {
  ariaLabel: string;
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  filterId: string;
  isOpen: boolean;
  onApply: (values: TransactionFilterFormData) => void;
  onClear: () => void;
  onClose: () => void;
  showMonth?: boolean;
  value: TransactionFilterState;
};

export function TransactionFilters({
  ariaLabel,
  accounts,
  categories,
  filterId,
  isOpen,
  onApply,
  onClear,
  onClose,
  showMonth = true,
  value,
}: TransactionFiltersProps) {
  const {
    accounts: appliedAccounts,
    categories: appliedCategories,
    includePreviousBalance: appliedIncludePreviousBalance,
    month: appliedMonth,
    q: appliedSearchTerm,
  } = value;
  const categoryFilterItems = buildCategoryFilterItems(categories);
  const accountFilterItems = buildAccountFilterItems(accounts);
  const { control, handleSubmit, register, reset, setFocus, setValue } =
    useForm<TransactionFilterFormData>({
      defaultValues: toFormValues(value),
      resolver: zodResolver(transactionFilterFormSchema),
    });
  const selectedAccounts = useWatch({ control, name: "accounts" }) ?? [];
  const selectedCategories = useWatch({ control, name: "categories" }) ?? [];
  const selectedIncludePreviousBalance =
    useWatch({ control, name: "includePreviousBalance" }) ?? appliedIncludePreviousBalance;
  const selectedMonth = useWatch({ control, name: "month" }) ?? appliedMonth;
  const allAccountsSelected = appliedAccounts.includes(allAccountsFilterValue);
  const hasAccountFilter = appliedAccounts.length > 0 && !allAccountsSelected;
  const activeFilterCount =
    1 +
    Number(appliedSearchTerm.trim().length > 0) +
    Number(appliedCategories.length > 0) +
    Number(hasAccountFilter);
  const searchField = register("search");

  useEffect(() => {
    reset({
      accounts: [...appliedAccounts],
      categories: [...appliedCategories],
      includePreviousBalance: appliedIncludePreviousBalance,
      month: appliedMonth,
      search: appliedSearchTerm,
    });
  }, [
    appliedAccounts,
    appliedCategories,
    appliedIncludePreviousBalance,
    appliedMonth,
    appliedSearchTerm,
    reset,
  ]);

  useEffect(() => {
    if (isOpen) {
      setFocus("search");
    }
  }, [isOpen, setFocus]);

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
    reset({
      accounts: [allAccountsFilterValue],
      categories: [],
      includePreviousBalance: value.includePreviousBalance,
      month: value.month,
      search: "",
    });
    onClear();
  };

  return (
    <Card
      as="aside"
      aria-label={ariaLabel}
      className={filtersStyles({ open: isOpen })}
      id={filterId}
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
          onPress={onClose}
        >
          <XIcon aria-hidden="true" />
        </Button>
      </CardHeader>

      <form className="grid gap-5.5" onSubmit={handleSubmit(onApply)}>
        <CardBody className="gap-5.5">
          <AriaTextField className="grid gap-2.5">
            <Label className="m-0 !text-caption-strong tracking-[0.04em] !text-muted uppercase">
              Buscar transação
            </Label>
            <div className="flex min-h-10.5 min-w-0 items-center gap-2.5 rounded-xl border border-border bg-[color-mix(in_oklch,var(--color-surface)_70%,transparent)] px-3 text-subtle transition-[background-color,border-color] duration-150 ease-out focus-within:border-brand focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-brand hover:border-border-strong hover:bg-surface-muted motion-reduce:transition-none [&>svg]:size-4 [&>svg]:shrink-0">
              <MagnifyingGlassIcon aria-hidden="true" />
              <Input
                {...searchField}
                id={`${filterId}-search`}
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
            <legend className="m-0 flex items-center justify-between gap-2 text-caption-strong tracking-label text-muted uppercase">
              <span>Contas</span>
              <Link
                aria-label="Gerenciar contas"
                className="size-8! min-h-8! rounded-lg!"
                isIconOnly
                preload="intent"
                size="sm"
                to="/accounts"
                variant="ghost"
              >
                <GearSixIcon aria-hidden="true" />
              </Link>
            </legend>
            <FilterTree
              ariaLabel="Contas"
              items={accountFilterItems}
              onSelectionChange={handleAccountTreeSelectionChange}
              selectedKeys={selectedAccounts}
            />
          </fieldset>

          <div className="grid gap-2.5">
            {showMonth && (
              <MonthYearFilter
                onChange={(month) => setValue("month", toYearMonth(month), { shouldDirty: true })}
                value={parseTransactionMonth(selectedMonth)}
              />
            )}
            <TransactionFilterCheckbox
              isSelected={selectedIncludePreviousBalance}
              onChange={(isSelected) =>
                setValue("includePreviousBalance", isSelected, { shouldDirty: true })
              }
            >
              Incluir saldo anterior
            </TransactionFilterCheckbox>
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
  );
}
