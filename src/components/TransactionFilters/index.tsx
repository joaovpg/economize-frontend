import { type ReactNode, useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { GearSixIcon } from "@phosphor-icons/react/dist/csr/GearSix";
import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/csr/MagnifyingGlass";
import { XIcon } from "@phosphor-icons/react/dist/csr/X";

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
import { tv } from "../../utils/tailwind";
import { Button } from "../Button";
import { Card, CardBody, CardFooter, CardHeader } from "../Card";
import { Checkbox } from "../fields/Checkbox";
import { TextField } from "../fields/TextField";
import { FilterTree, type FilterTreeItem } from "../FilterTree";
import { Link } from "../Link";
import { ModalBody, ModalFooter } from "../Modal";
import { MonthYearFilter } from "../MonthYearFilter";

// Estilo da barra lateral. No modo modal o componente não usa Card: corpo e rodapé vêm do Modal.
const filtersStyles = tv({
  base: "sticky top-6 w-auto self-start my-6 ml-6 max-h-[calc(100svh-3rem)] overflow-auto max-md:static max-md:mx-4 max-md:mt-0 max-md:mb-4 max-md:max-h-none",
  variants: {
    open: {
      false: "max-md:hidden",
      true: "max-md:grid",
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
  isDisabled?: boolean;
  isSelected: boolean;
  onChange: (isSelected: boolean) => void;
};

function TransactionFilterCheckbox({
  children,
  isDisabled = false,
  isSelected,
  onChange,
}: TransactionFilterCheckboxProps) {
  return (
    <Checkbox isDisabled={isDisabled} isSelected={isSelected} onChange={onChange}>
      {children}
    </Checkbox>
  );
}

export type TransactionFiltersProps = {
  ariaLabel: string;
  applyOnChange?: boolean;
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  disablePreviousBalance?: boolean;
  filterId: string;
  isOpen: boolean;
  onApply: (values: TransactionFilterFormData) => void;
  onClear: () => void;
  onClose: () => void;
  onSearchChange?: (search: string) => void;
  presentation?: "modal" | "sidebar";
  showMonth?: boolean;
  value: TransactionFilterState;
};

export function TransactionFilters({
  ariaLabel,
  applyOnChange = false,
  accounts,
  categories,
  disablePreviousBalance = false,
  filterId,
  isOpen,
  onApply,
  onClear,
  onClose,
  onSearchChange,
  presentation = "sidebar",
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
  const { control, getValues, handleSubmit, reset, setFocus, setValue } =
    useForm<TransactionFilterFormData>({
      defaultValues: toFormValues(value),
      resolver: zodResolver(transactionFilterFormSchema),
    });
  const selectedAccounts = useWatch({ control, name: "accounts" }) ?? [];
  const selectedCategories = useWatch({ control, name: "categories" }) ?? [];
  const selectedIncludePreviousBalance =
    useWatch({ control, name: "includePreviousBalance" }) ?? appliedIncludePreviousBalance;
  const selectedSearchTerm = useWatch({ control, name: "search" }) ?? appliedSearchTerm;
  const selectedMonth = useWatch({ control, name: "month" }) ?? appliedMonth;
  const allAccountsSelected = appliedAccounts.includes(allAccountsFilterValue);
  const hasAccountFilter = appliedAccounts.length > 0 && !allAccountsSelected;
  const activeFilterCount =
    1 +
    Number(appliedSearchTerm.trim().length > 0) +
    Number(appliedCategories.length > 0) +
    Number(hasAccountFilter);
  const isPreviousBalanceDisabled =
    disablePreviousBalance || (applyOnChange && selectedSearchTerm.trim().length > 0);

  useEffect(() => {
    reset({
      accounts: [...appliedAccounts],
      categories: [...appliedCategories],
      includePreviousBalance: appliedIncludePreviousBalance,
      month: appliedMonth,
      search: applyOnChange ? getValues("search") : appliedSearchTerm,
    });
  }, [
    appliedAccounts,
    appliedCategories,
    appliedIncludePreviousBalance,
    appliedMonth,
    appliedSearchTerm,
    applyOnChange,
    getValues,
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

    const keepAllAccountsSelected =
      hasAllAccountsSelected && (!hadAllAccountsSelected || individualAccounts.length === 0);
    const normalizedAccounts = keepAllAccountsSelected
      ? [allAccountsFilterValue]
      : individualAccounts;

    setValue("accounts", normalizedAccounts, { shouldDirty: true });

    if (applyOnChange) {
      onApply({ ...getValues(), accounts: normalizedAccounts, search: appliedSearchTerm });
    }
  };

  const handleCategoryTreeSelectionChange = (selectedCategoryIds: string[]) => {
    setValue("categories", selectedCategoryIds, { shouldDirty: true });

    if (applyOnChange) {
      onApply({
        ...getValues(),
        categories: selectedCategoryIds,
        search: appliedSearchTerm,
      });
    }
  };

  const handlePreviousBalanceChange = (isSelected: boolean) => {
    setValue("includePreviousBalance", isSelected, { shouldDirty: true });

    if (applyOnChange) {
      onApply({
        ...getValues(),
        includePreviousBalance: isSelected,
        search: appliedSearchTerm,
      });
    }
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

  const isModal = presentation === "modal";
  const { Body, Footer } = isModal
    ? { Body: ModalBody, Footer: ModalFooter }
    : { Body: CardBody, Footer: CardFooter };
  const formProps = isModal
    ? { "aria-label": ariaLabel, className: "flex min-h-0 min-w-0 flex-1 flex-col", id: filterId }
    : { className: "grid gap-6" };
  const sidebarFooterColumns = applyOnChange ? "grid-cols-1" : "grid-cols-2 gap-2";
  const sidebarHeader = isModal ? null : (
    <CardHeader>
      <div>
        <h2 className="m-0 text-title">Filtros</h2>
        <p className="m-0 text-caption text-muted">
          {activeFilterCount} {activeFilterCount === 1 ? "ativo" : "ativos"}
        </p>
      </div>
      <Button
        className="hidden! max-md:inline-flex!"
        variant="ghost"
        size="sm"
        isIconOnly
        aria-label="Fechar filtros"
        onPress={onClose}
      >
        <XIcon aria-hidden="true" />
      </Button>
    </CardHeader>
  );

  const filterForm = (
    <form
      {...formProps}
      onSubmit={(event) => {
        if (applyOnChange) {
          event.preventDefault();
          if (presentation === "modal") {
            onClose();
          }
          return;
        }

        void handleSubmit(onApply)(event);
      }}
    >
      <Body className="gap-6">
        <Controller
          control={control}
          name="search"
          render={({ field }) => (
            <TextField
              {...field}
              label="Buscar transação"
              leadingIcon={<MagnifyingGlassIcon aria-hidden="true" />}
              onChange={(nextSearch) => {
                field.onChange(nextSearch);
                if (applyOnChange) {
                  onSearchChange?.(nextSearch);
                }
              }}
              placeholder="Nome, descrição..."
              reserveErrorSpace={false}
              type="search"
            />
          )}
        />

        <fieldset className="grid min-w-0 gap-2 border-0 p-0">
          <legend className="m-0 flex w-full items-center justify-between gap-2 text-caption text-muted">
            <span>Categorias</span>
            <Link
              aria-label="Gerenciar categorias"
              className="size-8! min-h-8! rounded-control!"
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
            onSelectionChange={handleCategoryTreeSelectionChange}
            selectedKeys={selectedCategories}
          />
        </fieldset>

        <fieldset className="grid min-w-0 gap-2 border-0 p-0">
          <legend className="m-0 flex w-full items-center justify-between gap-2 text-caption text-muted">
            <span>Contas</span>
            <Link
              aria-label="Gerenciar contas"
              className="size-8! min-h-8! rounded-control!"
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

        <div className="grid gap-2">
          {showMonth && (
            <MonthYearFilter
              onChange={(month) => setValue("month", toYearMonth(month), { shouldDirty: true })}
              value={parseTransactionMonth(selectedMonth)}
            />
          )}
          <TransactionFilterCheckbox
            isDisabled={isPreviousBalanceDisabled}
            isSelected={selectedIncludePreviousBalance}
            onChange={handlePreviousBalanceChange}
          >
            Incluir saldo anterior
          </TransactionFilterCheckbox>
          {isPreviousBalanceDisabled && (
            <p className="m-0 text-caption text-muted">
              Disponível sem recortes de conta, categoria ou busca.
            </p>
          )}
        </div>
      </Body>
      <Footer className={isModal ? undefined : sidebarFooterColumns}>
        <Button variant="secondary" size="sm" type="button" onPress={handleClearFilters}>
          Limpar
        </Button>
        {(!applyOnChange || presentation === "modal") && (
          <Button
            variant="primary"
            size="sm"
            type={applyOnChange ? "button" : "submit"}
            onPress={applyOnChange ? onClose : undefined}
          >
            {applyOnChange ? "Concluir" : "Aplicar"}
          </Button>
        )}
      </Footer>
    </form>
  );

  if (isModal) {
    return filterForm;
  }

  return (
    <Card
      as="aside"
      aria-label={ariaLabel}
      className={filtersStyles({ open: isOpen })}
      data-presentation={presentation}
      id={filterId}
    >
      {sidebarHeader}
      {filterForm}
    </Card>
  );
}
