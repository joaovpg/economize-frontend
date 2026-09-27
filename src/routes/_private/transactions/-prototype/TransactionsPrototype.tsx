import { type RefObject } from "react";

import { FunnelIcon } from "@phosphor-icons/react/dist/csr/Funnel";
import { PlusIcon } from "@phosphor-icons/react/dist/csr/Plus";
import { useLocation } from "@tanstack/react-router";

import { TransactionTable } from "../-components/TransactionTable";
import { Button } from "../../../../components/Button";
import { Card, CardBody, CardHeader } from "../../../../components/Card";
import { FilterChip } from "../../../../components/FilterChip";
import {
  Modal,
  ModalBody,
  ModalClose,
  ModalDescription,
  ModalHeader,
  ModalTitle,
} from "../../../../components/Modal";
import { MonthYearFilter } from "../../../../components/MonthYearFilter";
import { PageHeading } from "../../../../components/PageHeading";
import { TransactionFilters } from "../../../../components/TransactionFilters";
import { formatCurrency } from "../../../../lib/formatters";
import {
  allAccountsFilterValue,
  getMonthLabel,
  type TransactionFilterFormData,
  type TransactionSearch,
} from "../../../../lib/transaction-filters";
import { type TransactionMonth } from "../../../../lib/transaction-month";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import {
  type ConsultaTransacaoItem,
  type ConsultaTransacoesResponse,
} from "../../../../services/transactions/contracts";
import { PrototypeSwitcher } from "./PrototypeSwitcher";

import type { PrototypeVariant } from "./prototype-variants";

type TransactionsPrototypeProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  data: ConsultaTransacoesResponse;
  feedback: string | null;
  filterTriggerRef: RefObject<HTMLButtonElement | null>;
  isFiltersOpen: boolean;
  items: readonly ConsultaTransacaoItem[];
  onApplyFilters: (values: TransactionFilterFormData) => void;
  onChangeVariant: (variant: PrototypeVariant) => void;
  onClearFilters: () => void;
  onCloseFilters: () => void;
  onDelete: (target: ConsultaTransacaoItem) => void;
  onEdit: (target: ConsultaTransacaoItem) => void;
  onMonthChange: (month: TransactionMonth) => void;
  onOpenCreation: () => void;
  onOpenFilters: () => void;
  search: TransactionSearch;
  selectedMonth: TransactionMonth;
  variant: PrototypeVariant;
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

function BalanceHero({
  data,
  items,
  variant,
}: {
  data: ConsultaTransacoesResponse;
  items: readonly ConsultaTransacaoItem[];
  variant: Extract<PrototypeVariant, "reference" | "ledger">;
}) {
  const metrics = getTransactionMetrics(items, data.saldoAbertura);

  return (
    <section
      aria-labelledby={`${variant}-projected-balance-title`}
      className={`overflow-hidden rounded-3xl bg-brand text-brand-foreground ${variant === "reference" ? "p-5.5 md:p-6" : "p-6 md:p-7"}`}
    >
      <div
        className={`grid gap-5 ${variant === "reference" ? "md:grid-cols-[minmax(12rem,1.35fr)_repeat(3,minmax(0,1fr))] md:items-center" : "sm:grid-cols-2 xl:grid-cols-[minmax(15rem,1.45fr)_repeat(3,minmax(0,1fr))] xl:items-center"}`}
      >
        <div className="min-w-0">
          <p className="m-0 text-caption-strong tracking-label text-brand-foreground/80 uppercase">
            Saldo projetado em {getMonthLabel(data.fim)}
          </p>
          <h2 className="m-0 mt-2 text-metric" id={`${variant}-projected-balance-title`}>
            {formatCurrency(metrics.projectedBalance)}
          </h2>
        </div>
        <Metric label="Entradas" value={metrics.entries} />
        <Metric label="Saídas" value={-metrics.exits} />
        <Metric label="Saldo anterior" value={metrics.openingBalance} />
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="min-w-0 border-t border-brand-foreground/30 pt-3.5 xl:border-t-0 xl:border-l xl:pl-5">
      <p className="m-0 text-caption-strong tracking-label text-brand-foreground/75 uppercase">
        {label}
      </p>
      <strong className="mt-2 block truncate text-body-large tabular-nums">
        {value >= 0 ? `+ ${formatCurrency(value)}` : `− ${formatCurrency(Math.abs(value))}`}
      </strong>
    </div>
  );
}

function PrototypeHeader({
  data,
  filterTriggerRef,
  isFiltersOpen,
  onMonthChange,
  onOpenCreation,
  onOpenFilters,
  search,
  selectedMonth,
}: Pick<
  TransactionsPrototypeProps,
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
      <header className="flex items-end justify-between gap-5 max-[48rem]:flex-col max-[48rem]:items-stretch max-[48rem]:gap-4">
        <PageHeading
          description={<>Movimentações de {getMonthLabel(data.inicio)}.</>}
          id="transactions-title"
          title="Transações"
        />
        <div className="flex items-center gap-2 max-[48rem]:grid max-[48rem]:grid-cols-1">
          <MonthYearFilter onChange={onMonthChange} value={selectedMonth} />
          <Button leadingIcon={<PlusIcon aria-hidden="true" />} onPress={onOpenCreation}>
            Nova movimentação
          </Button>
          <Button
            className="hidden! max-[48rem]:inline-flex!"
            ref={filterTriggerRef}
            aria-controls="transactions-filters"
            aria-expanded={isFiltersOpen}
            leadingIcon={<FunnelIcon aria-hidden="true" />}
            onPress={onOpenFilters}
            variant="secondary"
          >
            Filtros
          </Button>
        </div>
      </header>
      <div className="flex flex-wrap gap-2 max-[48rem]:mt-1" aria-label="Filtros ativos">
        <FilterChip>Mês: {getMonthLabel(search.month)}</FilterChip>
        {search.categories.length > 0 && <FilterChip>Categorias selecionadas</FilterChip>}
        {!search.accounts.includes(allAccountsFilterValue) && (
          <FilterChip>Contas selecionadas</FilterChip>
        )}
      </div>
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
}: Pick<TransactionsPrototypeProps, "accounts" | "categories" | "items" | "onDelete" | "onEdit"> & {
  openingBalance: number;
  title: string;
}) {
  return (
    <Card as="section" aria-labelledby="transactions-list-title">
      <CardHeader className="items-baseline">
        <h2 className="m-0 text-card-title text-foreground" id="transactions-list-title">
          {title}
        </h2>
        <span className="text-meta text-subtle">
          {items.length} {items.length === 1 ? "item" : "itens"}
        </span>
      </CardHeader>
      <CardBody spacing="none">
        {items.length > 0 ? (
          <TransactionTable
            accounts={accounts}
            categories={categories}
            items={items}
            onDelete={onDelete}
            onEdit={onEdit}
            openingBalance={openingBalance}
          />
        ) : (
          <p className="m-0 p-5.5 text-body-small text-muted">
            Nenhuma movimentação encontrada com esses filtros.
          </p>
        )}
      </CardBody>
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
  TransactionsPrototypeProps,
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
  TransactionsPrototypeProps,
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
      <ModalHeader>
        <ModalTitle>Filtros</ModalTitle>
        <ModalDescription>Refine as movimentações exibidas.</ModalDescription>
        <ModalClose />
      </ModalHeader>
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
          showMonth={false}
          value={search}
        />
      </ModalBody>
    </Modal>
  );
}

function ReferenceVariant(props: TransactionsPrototypeProps) {
  return (
    <div className="grid min-w-0 grid-cols-[18.25rem_minmax(0,1fr)] items-start max-[48rem]:block">
      <div className="max-[48rem]:hidden">
        <FiltersRail {...props} />
      </div>
      <main className="min-w-0 px-7 pt-8 pb-10 max-[48rem]:px-4 max-[48rem]:pt-6 max-[48rem]:pb-8">
        <div className="mx-auto flex max-w-260 min-w-0 flex-col gap-5.5">
          <PrototypeHeader {...props} />
          <BalanceHero data={props.data} items={props.data.itens} variant="reference" />
          {props.feedback && <p className="m-0 text-body-small text-success">{props.feedback}</p>}
          <TransactionList
            accounts={props.accounts}
            categories={props.categories}
            items={props.items}
            onDelete={props.onDelete}
            onEdit={props.onEdit}
            openingBalance={props.data.saldoAbertura}
            title="Movimentações do período"
          />
        </div>
      </main>
      <div className="max-[48rem]:block md:hidden">
        <MobileFilterModal
          accounts={props.accounts}
          categories={props.categories}
          isFiltersOpen={props.isFiltersOpen}
          onApplyFilters={props.onApplyFilters}
          onClearFilters={props.onClearFilters}
          onClose={props.onCloseFilters}
          search={props.search}
        />
      </div>
    </div>
  );
}

function LedgerVariant(props: TransactionsPrototypeProps) {
  return (
    <main className="mx-auto flex w-full max-w-260 min-w-0 flex-col gap-7 px-4 pt-7 pb-10 md:px-7 lg:px-0">
      <PrototypeHeader {...props} />
      <BalanceHero data={props.data} items={props.data.itens} variant="ledger" />
      <div className="grid min-w-0 gap-5.5 xl:grid-cols-[minmax(0,1fr)_18.25rem] xl:items-start">
        <TransactionList
          accounts={props.accounts}
          categories={props.categories}
          items={props.items}
          onDelete={props.onDelete}
          onEdit={props.onEdit}
          openingBalance={props.data.saldoAbertura}
          title="Livro de movimentações"
        />
        <div className="hidden xl:block">
          <FiltersRail {...props} />
        </div>
      </div>
      <div className="md:hidden">
        <MobileFilterModal
          accounts={props.accounts}
          categories={props.categories}
          isFiltersOpen={props.isFiltersOpen}
          onApplyFilters={props.onApplyFilters}
          onClearFilters={props.onClearFilters}
          onClose={props.onCloseFilters}
          search={props.search}
        />
      </div>
    </main>
  );
}

function FocusVariant(props: TransactionsPrototypeProps) {
  const metrics = getTransactionMetrics(props.data.itens, props.data.saldoAbertura);

  return (
    <main className="mx-auto flex w-full max-w-260 min-w-0 flex-col gap-5.5 px-4 pt-6 pb-10 md:px-7 lg:px-0">
      <PrototypeHeader {...props} />
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.15fr)_minmax(14rem,0.85fr)]">
        <section
          aria-labelledby="focus-balance-title"
          className="flex min-h-52 flex-col justify-between rounded-3xl bg-brand p-6 text-brand-foreground"
        >
          <div>
            <p className="m-0 text-caption-strong tracking-label text-brand-foreground/80 uppercase">
              Saldo projetado
            </p>
            <h2 className="m-0 mt-3 text-display-hero" id="focus-balance-title">
              {formatCurrency(metrics.projectedBalance)}
            </h2>
          </div>
          <p className="m-0 text-body-small text-brand-foreground/80">
            O mês fecha {metrics.projectedBalance >= 0 ? "positivo" : "negativo"} com os dados
            selecionados.
          </p>
        </section>
        <div className="grid grid-cols-2 gap-4">
          <StatCard label="Entradas" value={metrics.entries} tone="success" />
          <StatCard label="Saídas" value={-metrics.exits} tone="danger" />
          <StatCard label="Saldo anterior" value={metrics.openingBalance} tone="neutral" />
          <Card as="section">
            <CardBody spacing="compact">
              <span className="text-caption-strong tracking-label text-subtle uppercase">
                Período
              </span>
              <strong className="text-title-compact text-foreground">
                {getMonthLabel(props.search.month)}
              </strong>
            </CardBody>
          </Card>
        </div>
      </div>
      <TransactionList
        accounts={props.accounts}
        categories={props.categories}
        items={props.items}
        onDelete={props.onDelete}
        onEdit={props.onEdit}
        openingBalance={props.data.saldoAbertura}
        title="Movimentações"
      />
      <div className="md:hidden">
        <MobileFilterModal
          accounts={props.accounts}
          categories={props.categories}
          isFiltersOpen={props.isFiltersOpen}
          onApplyFilters={props.onApplyFilters}
          onClearFilters={props.onClearFilters}
          onClose={props.onCloseFilters}
          search={props.search}
        />
      </div>
    </main>
  );
}

function StatCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "danger" | "neutral" | "success";
  value: number;
}) {
  const valueClassName =
    tone === "success" ? "text-success" : tone === "danger" ? "text-danger" : "text-foreground";

  return (
    <Card as="section">
      <CardBody spacing="compact">
        <span className="text-caption-strong tracking-label text-subtle uppercase">{label}</span>
        <strong className={`text-title-compact tabular-nums ${valueClassName}`}>
          {value >= 0 ? `+ ${formatCurrency(value)}` : `− ${formatCurrency(Math.abs(value))}`}
        </strong>
      </CardBody>
    </Card>
  );
}

export function TransactionsPrototype(props: TransactionsPrototypeProps) {
  const { pathname } = useLocation();

  return (
    <>
      {props.variant === "reference" && <ReferenceVariant {...props} />}
      {props.variant === "ledger" && <LedgerVariant {...props} />}
      {props.variant === "focus" && <FocusVariant {...props} />}
      <PrototypeSwitcher current={props.variant} onChange={props.onChangeVariant} />
      <p className="sr-only">Protótipo descartável ativo na rota {pathname}.</p>
    </>
  );
}
