import { type ReactNode, type RefObject } from "react";

import { CaretLeftIcon } from "@phosphor-icons/react/dist/csr/CaretLeft";
import { CaretRightIcon } from "@phosphor-icons/react/dist/csr/CaretRight";
import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";

import { Button } from "../../../../components/Button";
import { Card } from "../../../../components/Card";
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
  hasTransactionScope: boolean;
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
  onSearchChange: (search: string) => void;
  search: TransactionSearch;
  selectedMonth: TransactionMonth;
};

type TransactionMetrics = {
  entries: number;
  openingBalance: number;
  projectedBalance: number;
  exits: number;
};

function isIncomeOrExpenseSummaryItem(item: ConsultaTransacaoItem) {
  switch (item.origem) {
    case "SALDO_INICIAL_CONTA":
    case "TRANSFERENCIA":
      return false;
    case "TRANSACAO_SIMPLES":
    case "TRANSACAO_RECORRENTE":
    case "PARCELA":
      return true;
    default: {
      const exhaustiveCheck: never = item.origem;
      return exhaustiveCheck;
    }
  }
}

function getTransactionMetrics(
  items: readonly ConsultaTransacaoItem[],
  openingBalance: number,
): TransactionMetrics {
  let entries = 0;
  let exits = 0;
  const movement = items.reduce((total, item) => total + item.valor, 0);

  for (const item of items) {
    if (!isIncomeOrExpenseSummaryItem(item)) {
      continue;
    }

    if (item.valor > 0) {
      entries += item.valor;
    } else if (item.valor < 0) {
      exits += Math.abs(item.valor);
    }
  }

  return {
    entries,
    exits,
    openingBalance,
    projectedBalance: openingBalance + movement,
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
  hasTransactionScope,
  includePreviousBalance,
  items,
}: {
  data: ConsultaTransacoesResponse;
  hasTransactionScope: boolean;
  includePreviousBalance: boolean;
  items: readonly ConsultaTransacaoItem[];
}) {
  const showOpeningBalance = includePreviousBalance && !hasTransactionScope;
  const openingBalance = showOpeningBalance ? data.saldoAbertura : 0;
  const metrics = getTransactionMetrics(items, openingBalance);
  const isScenario = hasTransactionScope || !includePreviousBalance;

  return (
    <section
      aria-labelledby="transactions-projection-title"
      className="overflow-hidden rounded-3xl bg-brand p-5.5 text-brand-foreground min-[60rem]:p-7"
    >
      {showOpeningBalance && (
        <div className="mb-5.5 flex items-start justify-between gap-4 border-b border-brand-foreground/30 pb-5.5 sm:items-center">
          <div className="min-w-0">
            <h2
              className="m-0 text-caption-strong tracking-label text-brand-foreground/80 uppercase"
              id="transactions-opening-balance-title"
            >
              Saldo de abertura
            </h2>
            <p className="m-0 mt-1 text-body-small text-brand-foreground/80">
              Seu ponto de partida no mês
            </p>
          </div>
          <strong className="text-card-title whitespace-nowrap tabular-nums sm:text-section-title">
            {formatCurrency(metrics.openingBalance)}
          </strong>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 min-[60rem]:grid-cols-[minmax(10rem,1.35fr)_repeat(2,minmax(0,1fr))] min-[60rem]:items-center">
        <div className="col-span-2 min-w-0 min-[60rem]:col-span-1">
          <p
            className="m-0 text-caption-strong tracking-label text-brand-foreground/80 uppercase"
            id="transactions-projection-title"
          >
            {hasTransactionScope
              ? `Projeção do recorte em ${getMonthLabel(data.fim)}`
              : `Saldo projetado em ${getMonthLabel(data.fim)}`}
          </p>
          <p className="m-0 mt-2 text-metric">{formatCurrency(metrics.projectedBalance)}</p>
          {isScenario && (
            <p className="m-0 mt-1.5 text-caption text-brand-foreground/80">
              Cenário calculado a partir de R$ 0,00 com os movimentos exibidos.
            </p>
          )}
        </div>
        <Metric label="Entradas" value={metrics.entries} />
        <Metric label="Saídas" value={-metrics.exits} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 border-t border-brand-foreground/30 pt-3.5 min-[60rem]:border-t-0 min-[60rem]:border-l min-[60rem]:pl-5">
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
      {(search.categories.length > 0 ||
        search.q.trim().length > 0 ||
        (search.accounts.length > 0 && !search.accounts.includes(allAccountsFilterValue))) && (
        <section aria-label="Filtros ativos" className="flex flex-wrap gap-2">
          {search.categories.length > 0 && <FilterChip>Categorias selecionadas</FilterChip>}
          {search.q.trim().length > 0 && <FilterChip>Busca: {search.q}</FilterChip>}
          {search.accounts.length > 0 && !search.accounts.includes(allAccountsFilterValue) && (
            <FilterChip>Contas selecionadas</FilterChip>
          )}
        </section>
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
  showOpeningBalance,
  balanceLabel,
  title,
}: Pick<TransactionsViewProps, "accounts" | "categories" | "items" | "onDelete" | "onEdit"> & {
  balanceLabel: string;
  openingBalance: number;
  showOpeningBalance: boolean;
  title: string;
}) {
  return (
    <Card as="section" aria-labelledby="transactions-list-title">
      <TransactionTable
        accounts={accounts}
        categories={categories}
        items={items}
        onDelete={onDelete}
        onEdit={onEdit}
        openingBalance={openingBalance}
        showOpeningBalance={showOpeningBalance}
        balanceLabel={balanceLabel}
        title={title}
      />
    </Card>
  );
}

function FiltersRail({
  accounts,
  categories,
  hasTransactionScope,
  isFiltersOpen,
  onApplyFilters,
  onClearFilters,
  onCloseFilters,
  onSearchChange,
  search,
}: Pick<
  TransactionsViewProps,
  | "accounts"
  | "categories"
  | "hasTransactionScope"
  | "isFiltersOpen"
  | "onApplyFilters"
  | "onClearFilters"
  | "onCloseFilters"
  | "onSearchChange"
  | "search"
>) {
  return (
    <TransactionFilters
      ariaLabel="Filtros de transações"
      applyOnChange
      accounts={accounts}
      categories={categories}
      disablePreviousBalance={hasTransactionScope}
      filterId="transactions-filters"
      isOpen={isFiltersOpen}
      onApply={onApplyFilters}
      onClear={onClearFilters}
      onClose={onCloseFilters}
      onSearchChange={onSearchChange}
      presentation="sidebar"
      showMonth={false}
      value={search}
    />
  );
}

function MobileFilterModal({
  accounts,
  categories,
  hasTransactionScope,
  isFiltersOpen,
  onApplyFilters,
  onClearFilters,
  onClose,
  onSearchChange,
  search,
}: Pick<
  TransactionsViewProps,
  | "accounts"
  | "categories"
  | "hasTransactionScope"
  | "isFiltersOpen"
  | "onApplyFilters"
  | "onClearFilters"
  | "onSearchChange"
  | "search"
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
          applyOnChange
          accounts={accounts}
          categories={categories}
          disablePreviousBalance={hasTransactionScope}
          filterId="transactions-filters-modal"
          isOpen
          onApply={onApplyFilters}
          onClear={onClearFilters}
          onClose={onClose}
          onSearchChange={onSearchChange}
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
      <div className="mx-auto grid w-full max-w-7xl min-w-0 items-start min-[60rem]:grid-cols-[18.25rem_minmax(0,1fr)]">
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
  const showOpeningBalance = props.search.includePreviousBalance && !props.hasTransactionScope;
  const isScenario = props.hasTransactionScope || !props.search.includePreviousBalance;

  return (
    <TransactionsFrame props={props}>
      <TransactionsHeader {...props} />
      <BalanceHero
        data={props.data}
        hasTransactionScope={props.hasTransactionScope}
        includePreviousBalance={props.search.includePreviousBalance}
        items={props.items}
      />
      {props.feedback && <p className="m-0 text-body-small text-success">{props.feedback}</p>}
      <TransactionList
        accounts={props.accounts}
        categories={props.categories}
        items={props.items}
        onDelete={props.onDelete}
        onEdit={props.onEdit}
        openingBalance={showOpeningBalance ? props.data.saldoAbertura : 0}
        showOpeningBalance={showOpeningBalance}
        balanceLabel={
          props.hasTransactionScope
            ? "Acumulado do recorte"
            : isScenario
              ? "Acumulado do mês"
              : "Saldo do dia"
        }
        title="Movimentações"
      />
    </TransactionsFrame>
  );
}
