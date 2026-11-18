import { useMemo } from "react";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";

import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { RepeatIcon } from "@phosphor-icons/react/dist/csr/Repeat";
import { TagIcon } from "@phosphor-icons/react/dist/csr/Tag";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";

import { Button } from "../../../../components/Button";
import { formatCurrency, formatSignedCurrency } from "../../../../lib/formatters";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { type ConsultaTransacaoItem } from "../../../../services/transactions/contracts";
import { cn } from "../../../../utils/tailwind";
import { getAccountLabel, getCategoryLabel } from "./transaction-labels";

// Valores de linha e saldos ficam neutros: a cor por sinal aparece só nos totais do resumo.
const moneyClassName = "whitespace-nowrap text-body-strong text-foreground tabular-nums";

type TransactionTableProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  items: readonly ConsultaTransacaoItem[];
  onDelete: (target: ConsultaTransacaoItem) => void;
  onEdit: (target: ConsultaTransacaoItem) => void;
  balanceLabel: string;
  openingBalance: number;
  showOpeningBalance: boolean;
  title: string;
};

type TransactionDayGroup = {
  balance: number;
  date: string;
  items: ConsultaTransacaoItem[];
};

function groupTransactionsByDay(
  items: readonly ConsultaTransacaoItem[],
  openingBalance: number,
): readonly TransactionDayGroup[] {
  const groups = new Map<string, TransactionDayGroup>();
  let balance = openingBalance;

  for (const item of items.toSorted((left, right) =>
    left.dataFinanceira.localeCompare(right.dataFinanceira),
  )) {
    balance += item.valor;
    let group = groups.get(item.dataFinanceira);

    if (!group) {
      group = { balance, date: item.dataFinanceira, items: [] };
      groups.set(item.dataFinanceira, group);
    }

    group.balance = balance;
    group.items.push(item);
  }

  return [...groups.values()];
}

function isRecurringItem(item: ConsultaTransacaoItem) {
  return item.origem === "TRANSACAO_RECORRENTE" || item.origem === "PARCELA";
}

// Um valor nulo é tratado como Planejada para a exibição. O saldo inicial, que a API envia sem
// situação, não é um lançamento planejado e fica sem o selo.
function isPlannedItem(item: ConsultaTransacaoItem) {
  if (item.origem === "SALDO_INICIAL_CONTA") return false;
  return (item.situacao ?? "PLANEJADA") === "PLANEJADA";
}

// Transferências e saldo inicial têm categoria própria no rótulo; o resto depende de `categoriaId`.
function hasCategory(item: ConsultaTransacaoItem) {
  return (
    item.origem === "TRANSFERENCIA" ||
    item.origem === "SALDO_INICIAL_CONTA" ||
    item.categoriaId !== null
  );
}

function getTransactionDescription(item: ConsultaTransacaoItem) {
  const { descricao } = item;
  const numeroParcela = item.serie?.numeroParcela;
  const totalParcelas = item.serie?.totalParcelas;

  if (
    typeof numeroParcela === "number" &&
    numeroParcela > 0 &&
    typeof totalParcelas === "number" &&
    totalParcelas > 0
  ) {
    return `${descricao} (${numeroParcela}/${totalParcelas})`;
  }

  return descricao;
}

function capitalize(text: string) {
  return text.charAt(0).toLocaleUpperCase("pt-BR") + text.slice(1);
}

const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "UTC",
  weekday: "short",
});

const dayMonthFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

// Ex.: "Seg, 16 de nov.". O pt-BR abreviado traz ponto no dia da semana, que o cabeçalho não usa.
function formatDayHeading(date: string) {
  const value = new Date(`${date}T00:00:00Z`);
  const weekday = weekdayFormatter.format(value).replace(/\.$/, "");
  return `${capitalize(weekday)}, ${dayMonthFormatter.format(value)}`;
}

function getItemKey(item: ConsultaTransacaoItem) {
  return item.chaveItem;
}

function getMarkContent(item: ConsultaTransacaoItem, categories: readonly CategoriaResponse[]) {
  if (isRecurringItem(item)) {
    return <RepeatIcon aria-hidden="true" className="size-4" />;
  }

  if (!hasCategory(item)) {
    return <TagIcon aria-hidden="true" className="size-4" />;
  }

  const initial = getCategoryLabel(item, categories).charAt(0).toLocaleUpperCase("pt-BR");
  return <span className="font-semibold">{initial}</span>;
}

// Ícone neutro da linha: inicial da categoria, ícone de recorrência ou de tag quando não há categoria.
// É decorativo; o nome da categoria segue no texto da linha.
function TransactionMark({
  categories,
  item,
}: {
  categories: readonly CategoriaResponse[];
  item: ConsultaTransacaoItem;
}) {
  return (
    <span
      aria-hidden="true"
      className="grid size-8 shrink-0 place-items-center rounded-control bg-surface-muted text-caption text-muted"
      title={isRecurringItem(item) ? "Transação recorrente" : undefined}
    >
      {getMarkContent(item, categories)}
    </span>
  );
}

function TransactionActions({
  item,
  onDelete,
  onEdit,
}: Pick<TransactionTableProps, "onDelete" | "onEdit"> & { item: ConsultaTransacaoItem }) {
  return (
    <MenuTrigger>
      <Button
        aria-label={`Ações de ${getTransactionDescription(item)}`}
        className="max-md:[--button-height:var(--spacing-touch)] [&_svg]:size-4"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <DotsThreeVerticalIcon aria-hidden="true" />
      </Button>
      <Popover
        className="z-50 min-w-menu rounded-surface border border-border bg-surface p-1 shadow-popover outline-none"
        offset={4}
        placement="bottom end"
      >
        <Menu aria-label={`Ações de ${getTransactionDescription(item)}`} className="outline-none">
          <MenuItem
            className="flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-body text-foreground outline-none data-focused:bg-surface-muted"
            onAction={() => onEdit(item)}
            textValue="Editar"
          >
            <PencilSimpleIcon aria-hidden="true" className="size-4 shrink-0" />
            Editar
          </MenuItem>
          <MenuItem
            className="flex cursor-pointer items-center gap-2 rounded-control px-3 py-2 text-body text-danger outline-none data-focused:bg-danger-soft"
            onAction={() => onDelete(item)}
            textValue="Excluir"
          >
            <TrashIcon aria-hidden="true" className="size-4 shrink-0" />
            Excluir
          </MenuItem>
        </Menu>
      </Popover>
    </MenuTrigger>
  );
}

export function TransactionTable({
  accounts,
  categories,
  items,
  onDelete,
  onEdit,
  openingBalance,
  showOpeningBalance,
  balanceLabel,
  title,
}: TransactionTableProps) {
  const dayGroups = useMemo(
    () => groupTransactionsByDay(items, openingBalance),
    [items, openingBalance],
  );

  return (
    <div className="min-w-0 overflow-hidden">
      <table className="w-full border-collapse text-left">
        <caption className="border-b border-border p-4 text-left md:p-6">
          <span className="flex items-baseline justify-between gap-4">
            <span className="text-title text-foreground" id="transactions-list-title">
              {title}
            </span>
            <span className="text-caption text-muted">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </span>
          </span>
        </caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">Descrição / Categoria / Conta</th>
            <th scope="col">Valor</th>
            <th scope="col">Ações</th>
          </tr>
        </thead>
        <tbody>
          {showOpeningBalance && (
            <tr className="bg-surface">
              <th
                className="border-b border-border px-4 py-3 text-left text-caption text-muted"
                scope="row"
              >
                Saldo de abertura
                <span className="sr-only">, antes da primeira movimentação</span>
              </th>
              <td className="border-b border-border py-3 pr-3 text-right align-middle">
                <strong className={moneyClassName}>{formatCurrency(openingBalance)}</strong>
              </td>
              <td aria-hidden="true" className="border-b border-border" />
            </tr>
          )}
          {items.length === 0 && (
            <tr>
              <td className="px-4 py-5 text-body text-muted" colSpan={3}>
                Nenhuma movimentação encontrada com esses filtros.
              </td>
            </tr>
          )}
        </tbody>
        {dayGroups.map((group) => (
          <tbody key={group.date}>
            <tr>
              <th
                aria-label={`${formatDayHeading(group.date)}, ${balanceLabel} ${formatCurrency(group.balance)}`}
                className="border-b border-border bg-canvas py-2 pr-3 pl-4 text-left text-caption text-muted"
                colSpan={2}
                scope="rowgroup"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <time className="font-semibold text-foreground" dateTime={group.date}>
                    {formatDayHeading(group.date)}
                  </time>
                  <span className="whitespace-nowrap">
                    {balanceLabel}{" "}
                    <span className="font-semibold text-foreground tabular-nums">
                      {formatCurrency(group.balance)}
                    </span>
                  </span>
                </div>
              </th>
              <td aria-hidden="true" className="border-b border-border bg-canvas" />
            </tr>
            {group.items.map((item) => {
              const planned = isPlannedItem(item);
              const description = getTransactionDescription(item);
              const categoryLabel = getCategoryLabel(item, categories);
              const accountLabel = getAccountLabel(item, accounts);

              return (
                <tr key={getItemKey(item)}>
                  <td
                    aria-label={`${description}${isRecurringItem(item) ? ", transação recorrente" : ""}${planned ? ", planejada" : ""}, ${categoryLabel}, ${accountLabel}`}
                    className="w-full max-w-0 border-b border-border py-3 pr-3 pl-4 align-middle"
                  >
                    <div className={cn("flex min-w-0 items-center gap-3", planned && "opacity-60")}>
                      <TransactionMark categories={categories} item={item} />
                      <div className="min-w-0 flex-1">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="min-w-0 truncate text-body-strong text-foreground">
                            {description}
                          </span>
                          {planned && (
                            <span className="shrink-0 rounded-sm border border-border px-1 text-caption text-muted max-md:hidden">
                              Planejada
                            </span>
                          )}
                        </div>
                        <div className="truncate text-caption text-muted">
                          {planned && <span className="md:hidden">Planejada · </span>}
                          {categoryLabel} · {accountLabel}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="border-b border-border py-3 pr-3 text-right align-middle">
                    <strong className={cn(moneyClassName, planned && "opacity-60")}>
                      {formatSignedCurrency(item.valor)}
                    </strong>
                  </td>
                  <td className="border-b border-border py-2 pr-2 text-center align-middle">
                    {item.origem !== "SALDO_INICIAL_CONTA" && (
                      <TransactionActions item={item} onDelete={onDelete} onEdit={onEdit} />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}
