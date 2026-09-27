import { type ReactNode, type RefObject } from "react";

import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { Button } from "../../../../components/Button";
import { Card, CardBody, CardHeader } from "../../../../components/Card";
import { FilterChip } from "../../../../components/FilterChip";
import { Modal, ModalBody } from "../../../../components/Modal";
import { PageHeading } from "../../../../components/PageHeading";
import { TransactionFilters } from "../../../../components/TransactionFilters";
import { formatCurrency } from "../../../../lib/formatters";
import {
  allAccountsFilterValue,
  getMonthLabel,
  type TransactionFilterFormData,
  type TransactionSearch,
} from "../../../../lib/transaction-filters";
import {
  isYearMonthWithinApiFormat,
  toYearMonth,
  type TransactionMonth,
} from "../../../../lib/transaction-month";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import {
  type ConsultaTransacaoItem,
  type ConsultaTransacoesResponse,
} from "../../../../services/transactions/contracts";
import { TransactionTable } from "./TransactionTable";
type TransactionsViewProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  data: ConsultaTransacoesResponse;
  feedback: string | null;
  filterTriggerRef: RefObject<HTMLButtonElement | null>;
  isFiltersOpen: boolean;
  items: readonly ConsultaTransacaoItem[];
  onApplyFilters: (values: TransactionFilterFormData) => void;
  onClearFilters: () => void;
  onCloseFilters: () => void;
  onDelete: (target: ConsultaTransacaoItem) => void;
  onEdit: (target: ConsultaTransacaoItem) => void;
  onMonthChange: (month: TransactionMonth) => void;
  onOpenCreation: () => void;
  onOpenFilters: () => void;
  search: TransactionSearch;
  selectedMonth: TransactionMonth;
};

type TransactionMetrics = {
  entries: number;
  openingBalance: number;
  projectedBalance: number;
  exits: number;
};

function getTransactionMetrics(
  items: readonly ConsultaTransacaoItem[],
  openingBalance: number,
): TransactionMetrics {
  const entries = items.reduce((total, item) => (item.valor > 0 ? total + item.valor : total), 0);
  const exits = items.reduce(
    (total, item) => (item.valor < 0 ? total + Math.abs(item.valor) : total),
    0,
  );

  return {
    entries,
    exits,
    openingBalance,
    projectedBalance: openingBalance + entries - exits,
  };
}

function MonthStepper({
  className,
  onChange,
  value,
}: {
  className?: string;
  onChange: (value: TransactionMonth) => void;
  value: TransactionMonth;
}) {
  const previousMonth = value.subtract({ months: 1 });
  const nextMonth = value.add({ months: 1 });

  return (
    <fieldset
      className={[
        "flex min-w-0 items-center justify-between gap-2 rounded-2xl border border-border card-background p-1",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <legend className="sr-only">Selecionar mês</legend>
      <Button
        aria-label="Mês anterior"
        isDisabled={!isYearMonthWithinApiFormat(previousMonth)}
        isIconOnly
        onPress={() => onChange(previousMonth)}
        size="sm"
        variant="ghost"
      >
        <CaretLeftIcon aria-hidden="true" />
      </Button>
      <span className="min-w-28 text-center text-caption-strong text-foreground uppercase">
        {getMonthLabel(toYearMonth(value))}
      </span>
      <Button
        aria-label="Próximo mês"
        isDisabled={!isYearMonthWithinApiFormat(nextMonth)}
        isIconOnly
        onPress={() => onChange(nextMonth)}
        size="sm"
        variant="ghost"
      >
        <CaretRightIcon aria-hidden="true" />
      </Button>
    </fieldset>
  );
}

function BalanceHero({
  data,
  items,
}: {
  data: ConsultaTransacoesResponse;
  items: readonly ConsultaTransacaoItem[];
}) {
  const metrics = getTransactionMetrics(items, data.saldoAbertura);

  return (
    <section
      aria-labelledby="transactions-projected-balance-title"
      className="overflow-hidden rounded-3xl bg-brand p-5.5 text-brand-foreground min-[60rem]:p-7"
    >
      <div className="grid grid-cols-2 gap-4 min-[60rem]:grid-cols-[minmax(10rem,1.35fr)_repeat(3,minmax(0,1fr))] min-[60rem]:items-center">
        <div className="col-span-2 min-w-0 min-[60rem]:col-span-1">
          <p className="m-0 text-caption-strong tracking-label text-brand-foreground/80 uppercase">
            Saldo projetado em {getMonthLabel(data.fim)}
          </p>
          <h2 className="m-0 mt-2 text-metric" id="transactions-projected-balance-title">
            {formatCurrency(metrics.projectedBalance)}
          </h2>
        </div>
        <Metric label="Entradas" value={metrics.entries} />
        <Metric label="Saídas" value={-metrics.exits} />
        <Metric
          className="hidden min-[40rem]:block"
          label="Saldo anterior"
          value={metrics.openingBalance}
        />
      </div>
    </section>
  );
}

function Metric({ className, label, value }: { className?: string; label: string; value: number }) {
  return (
    <div
      className={`min-w-0 border-t border-brand-foreground/30 pt-3.5 min-[60rem]:border-t-0 min-[60rem]:border-l min-[60rem]:pl-5 ${className ?? ""}`}
    >
      <p className="m-0 text-caption-strong tracking-label text-brand-foreground/75 uppercase">
        {label}
      </p>
      <strong className="mt-2 block text-label whitespace-nowrap tabular-nums">
        {value >= 0 ? `+ ${formatCurrency(value)}` : `− ${formatCurrency(Math.abs(value))}`}
      </strong>
    </div>
  );
}

function TransactionsHeader({
  data,
  filterTriggerRef,
  isFiltersOpen,
  onMonthChange,
  onOpenCreation,
  onOpenFilters,
  search,
  selectedMonth,
}: Pick<
  TransactionsViewProps,
  | "data"
  | "filterTriggerRef"
  | "isFiltersOpen"
  | "onMonthChange"
  | "onOpenCreation"
  | "onOpenFilters"
  | "search"
  | "selectedMonth"
>) {
  return (
    <>
      <header className="flex items-start justify-between gap-5 max-[48rem]:flex-col max-[48rem]:gap-4 sm:items-end">
        <PageHeading
          description={<>Movimentações de {getMonthLabel(data.inicio)}.</>}
          id="transactions-title"
          size="compact"
          title="Transações"
        />
        <div className="grid w-full gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:justify-end">
          <MonthStepper
            className="w-full sm:w-auto"
            onChange={onMonthChange}
            value={selectedMonth}
          />
          <Button
            className="w-full sm:w-auto"
            leadingIcon={<PlusIcon aria-hidden="true" />}
            onPress={onOpenCreation}
          >
            Nova movimentação
          </Button>
          <Button
            className="hidden! max-[60rem]:inline-flex!"
            ref={filterTriggerRef}
            aria-controls="transactions-filters"
            aria-expanded={isFiltersOpen}
            leadingIcon={<FunnelIcon aria-hidden="true" />}
            onPress={onOpenFilters}
            variant="secondary"
          >
            Mais filtros
          </Button>
        </div>
      </header>
      {(search.categories.length > 0 || !search.accounts.includes(allAccountsFilterValue)) && (
        <div className="flex flex-wrap gap-2" aria-label="Filtros ativos">
          {search.categories.length > 0 && <FilterChip>Categorias selecionadas</FilterChip>}
          {!search.accounts.includes(allAccountsFilterValue) && (
            <FilterChip>Contas selecionadas</FilterChip>
          )}
        </div>
      )}
    </>
  );
}

function TransactionList({
  accounts,
  categories,
  items,
  onDelete,
  onEdit,
  openingBalance,
  title,
}: Pick<TransactionsViewProps, "accounts" | "categories" | "items" | "onDelete" | "onEdit"> & {
  openingBalance: number;
  title: string;
}) {
  return (
    <Card as="section" aria-labelledby="transactions-list-title">
      {items.length > 0 ? (
        <TransactionTable
          accounts={accounts}
          categories={categories}
          items={items}
          onDelete={onDelete}
          onEdit={onEdit}
          openingBalance={openingBalance}
          title={title}
        />
      ) : (
        <>
          <CardHeader className="items-baseline">
            <h2 className="m-0 text-card-title text-foreground" id="transactions-list-title">
              {title}
            </h2>
            <span className="text-meta text-subtle">0 itens</span>
          </CardHeader>
          <CardBody spacing="none">
            <p className="m-0 p-5.5 text-body-small text-muted">
              Nenhuma movimentação encontrada com esses filtros.
            </p>
          </CardBody>
        </>
      )}
    </Card>
  );
}

function FiltersRail({
  accounts,
  categories,
  isFiltersOpen,
  onApplyFilters,
  onClearFilters,
  onCloseFilters,
  search,
}: Pick<
  TransactionsViewProps,
  | "accounts"
  | "categories"
  | "isFiltersOpen"
  | "onApplyFilters"
  | "onClearFilters"
  | "onCloseFilters"
  | "search"
>) {
  return (
    <TransactionFilters
      ariaLabel="Filtros de transações"
      accounts={accounts}
      categories={categories}
      filterId="transactions-filters"
      isOpen={isFiltersOpen}
      onApply={onApplyFilters}
      onClear={onClearFilters}
      onClose={onCloseFilters}
      presentation="sidebar"
      showMonth={false}
      value={search}
    />
  );
}

function MobileFilterModal({
  accounts,
  categories,
  isFiltersOpen,
  onApplyFilters,
  onClearFilters,
  onClose,
  search,
}: Pick<
  TransactionsViewProps,
  "accounts" | "categories" | "isFiltersOpen" | "onApplyFilters" | "onClearFilters" | "search"
> & { onClose: () => void }) {
  return (
    <Modal
      aria-label="Filtros de transações"
      isDismissable
      isOpen={isFiltersOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      size="md"
    >
      <ModalBody>
        <TransactionFilters
          ariaLabel="Filtros avançados de transações"
          accounts={accounts}
          categories={categories}
          filterId="transactions-filters-modal"
          isOpen
          onApply={onApplyFilters}
          onClear={onClearFilters}
          onClose={onClose}
          presentation="modal"
          showMonth={false}
          value={search}
        />
      </ModalBody>
    </Modal>
  );
}

function TransactionsFrame({
  children,
  props,
}: {
  children: ReactNode;
  props: TransactionsViewProps;
}) {
  return (
    <>
      <div className="mx-auto grid w-full max-w-320 min-w-0 items-start min-[60rem]:grid-cols-[18.25rem_minmax(0,1fr)]">
        <div className="hidden min-[60rem]:block">
          <FiltersRail {...props} />
        </div>
        <main className="min-w-0 px-4 pt-5.5 pb-8 sm:px-6 min-[60rem]:px-7 min-[60rem]:pt-8 min-[60rem]:pb-10">
          <div className="flex w-full min-w-0 flex-col gap-5.5 min-[60rem]:gap-7">{children}</div>
        </main>
      </div>
      <div className="min-[60rem]:hidden">
        <MobileFilterModal {...props} onClose={props.onCloseFilters} />
      </div>
    </>
  );
}

export function TransactionsView(props: TransactionsViewProps) {
  return (
    <TransactionsFrame props={props}>
      <TransactionsHeader {...props} />
      <BalanceHero data={props.data} items={props.data.itens} />
      {props.feedback && <p className="m-0 text-body-small text-success">{props.feedback}</p>}
      <TransactionList
        accounts={props.accounts}
        categories={props.categories}
        items={props.items}
        onDelete={props.onDelete}
        onEdit={props.onEdit}
        openingBalance={props.data.saldoAbertura}
        title="Movimentações"
      />
    </TransactionsFrame>
  );
}
