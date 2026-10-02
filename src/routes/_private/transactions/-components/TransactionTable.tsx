import { useMemo } from "react";
import { Menu, MenuItem, MenuTrigger, Popover } from "react-aria-components";

import { DotsThreeVerticalIcon } from "@phosphor-icons/react/dist/csr/DotsThreeVertical";
import { PencilSimpleIcon } from "@phosphor-icons/react/dist/csr/PencilSimple";
import { RepeatIcon } from "@phosphor-icons/react/dist/csr/Repeat";
import { TrashIcon } from "@phosphor-icons/react/dist/csr/Trash";

import { Button } from "../../../../components/Button";
import { formatCurrency, formatSignedCurrency } from "../../../../lib/formatters";
import { type ContaResponse } from "../../../../services/accounts/contracts";
import { type CategoriaResponse } from "../../../../services/categories/contracts";
import { type ConsultaTransacaoItem } from "../../../../services/transactions/contracts";
import { getAccountLabel, getCategoryLabel } from "./transaction-labels";

type TransactionTableProps = {
  accounts: readonly ContaResponse[];
  categories: readonly CategoriaResponse[];
  items: readonly ConsultaTransacaoItem[];
  onDelete: (target: ConsultaTransacaoItem) => void;
  onEdit: (target: ConsultaTransacaoItem) => void;
  openingBalance: number;
  title: string;
};

type TransactionDayGroup = {
  balance: number;
  date: string;
  entries: number;
  exits: number;
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
      group = { balance, date: item.dataFinanceira, entries: 0, exits: 0, items: [] };
      groups.set(item.dataFinanceira, group);
    }

    group.balance = balance;
    group.items.push(item);

    if (item.origem !== "SALDO_INICIAL_CONTA" && item.origem !== "TRANSFERENCIA") {
      if (item.valor > 0) {
        group.entries += item.valor;
      } else {
        group.exits += Math.abs(item.valor);
      }
    }
  }

  return [...groups.values()];
}

function isRecurringItem(item: ConsultaTransacaoItem) {
  return item.origem === "TRANSACAO_RECORRENTE" || item.origem === "PARCELA";
}

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  timeZone: "UTC",
});

function formatTransactionDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

function getItemKey(item: ConsultaTransacaoItem) {
  return `${item.operacaoId ?? item.segmentoRecorrenciaId ?? item.grupoRecorrenciaId ?? "item"}-${item.contaId}-${item.dataFinanceira}-${item.origem}`;
}

function TransactionActions({
  item,
  onDelete,
  onEdit,
}: Pick<TransactionTableProps, "onDelete" | "onEdit"> & { item: ConsultaTransacaoItem }) {
  return (
    <MenuTrigger>
      <Button
        aria-label={`Ações de ${item.descricao}`}
        className="size-6! [&_svg]:size-3.5"
        isIconOnly
        size="sm"
        variant="ghost"
      >
        <DotsThreeVerticalIcon aria-hidden="true" />
      </Button>
      <Popover
        className="z-50 min-w-40 rounded-xl border border-border bg-surface p-1 shadow-lg outline-none"
        offset={4}
        placement="bottom end"
      >
        <Menu aria-label={`Ações de ${item.descricao}`} className="outline-none">
          <MenuItem
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-body-small text-foreground outline-none data-focused:bg-surface-muted"
            onAction={() => onEdit(item)}
            textValue="Editar"
          >
            <PencilSimpleIcon aria-hidden="true" className="size-4 shrink-0" />
            Editar
          </MenuItem>
          <MenuItem
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-body-small text-danger outline-none data-focused:bg-danger-soft"
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
  title,
}: TransactionTableProps) {
  const dayGroups = useMemo(
    () => groupTransactionsByDay(items, openingBalance),
    [items, openingBalance],
  );

  return (
    <div className="min-w-0 overflow-hidden">
      <table className="block w-full border-collapse text-left md:table md:table-fixed">
        <caption className="block border-b border-border p-5.5 text-left md:table-caption">
          <span className="flex items-baseline justify-between gap-4">
            <span className="text-card-title text-foreground" id="transactions-list-title">
              {title}
            </span>
            <span className="text-meta text-subtle">
              {items.length} {items.length === 1 ? "item" : "itens"}
            </span>
          </span>
        </caption>
        <colgroup className="hidden md:table-column-group">
          <col className="w-1/6" />
          <col />
          <col className="w-1/4" />
          <col className="w-8" />
        </colgroup>
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-border">
            <th className="px-5 py-3 text-caption text-muted" scope="col">
              Dia
            </th>
            <th className="px-5 py-3 text-caption text-muted" scope="col">
              Descrição / Categoria / Conta
            </th>
            <th className="py-3 pr-1 pl-5 text-right text-caption text-muted" scope="col">
              Valor
            </th>
            <th className="w-8 px-1 py-3" scope="col">
              <span className="sr-only">Ações</span>
            </th>
          </tr>
        </thead>
        <tbody className="block md:table-row-group">
          <tr className="grid grid-cols-[minmax(0,1fr)_auto_2rem] items-center border-b border-border bg-surface-muted py-3 pr-3 pl-4 md:table-row md:p-0">
            <th
              aria-label="Saldo de abertura, antes da primeira movimentação"
              className="min-w-0 p-0 pr-3 text-left text-caption-strong text-foreground md:px-5 md:py-3"
              colSpan={2}
              scope="row"
            >
              <span className="flex flex-col gap-1">
                <span>Saldo de abertura</span>
                <span className="text-caption text-muted">Antes da primeira movimentação</span>
              </span>
            </th>
            <td className="p-0 pr-1 text-right md:py-3 md:pl-5">
              <strong
                className={`text-caption-strong whitespace-nowrap tabular-nums ${openingBalance >= 0 ? "text-success" : "text-danger"}`}
              >
                {formatCurrency(openingBalance)}
              </strong>
            </td>
            <td aria-hidden="true" className="w-8 px-1 py-0" />
          </tr>
          {items.length === 0 && (
            <tr className="block md:table-row">
              <td className="block p-5.5 text-body-small text-muted md:table-cell" colSpan={4}>
                Nenhuma movimentação encontrada com esses filtros.
              </td>
            </tr>
          )}
        </tbody>
        {dayGroups.map((group) => (
          <tbody className="block md:table-row-group" key={group.date}>
            {group.items.map((item, itemIndex) => (
              <tr
                className="grid grid-cols-[minmax(0,1fr)_auto_2rem] items-center border-b border-border py-3 pr-3 pl-4 md:table-row md:p-0"
                key={getItemKey(item)}
              >
                <td
                  className={`col-span-3 p-0 text-caption text-foreground md:table-cell md:px-5 md:py-3 md:align-top ${itemIndex === 0 ? "pb-2.5" : "hidden"}`}
                >
                  {itemIndex === 0 && (
                    <time dateTime={group.date}>{formatTransactionDate(group.date)}</time>
                  )}
                </td>
                <td
                  aria-label={`${item.descricao}${isRecurringItem(item) ? ", transação recorrente" : ""}${item.situacao === "PLANEJADA" ? ", planejada" : ""}, ${getCategoryLabel(item, categories)}, ${getAccountLabel(item, accounts)}`}
                  className="min-w-0 p-0 pr-3 md:px-5 md:py-3 md:align-top"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-start gap-1.5">
                      {isRecurringItem(item) && (
                        <span
                          className="inline-flex h-4 shrink-0 items-center text-brand"
                          title="Transação recorrente"
                        >
                          <RepeatIcon aria-hidden="true" className="size-3.5" />
                          <span className="sr-only">Transação recorrente</span>
                        </span>
                      )}
                      <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 gap-y-1 text-caption-strong wrap-break-word text-foreground">
                        <span className="min-w-0 wrap-break-word">{item.descricao}</span>
                        {item.situacao === "PLANEJADA" && (
                          <span className="inline-block rounded border border-border px-1 text-caption text-muted">
                            Planejada
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="text-caption wrap-break-word text-muted">
                      {getCategoryLabel(item, categories)} · {getAccountLabel(item, accounts)}
                    </div>
                  </div>
                </td>
                <td className="p-0 pr-1 text-right md:py-3 md:pl-5 md:align-middle">
                  <strong
                    className={`text-caption-strong whitespace-nowrap tabular-nums ${item.valor >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {formatSignedCurrency(item.valor)}
                  </strong>
                </td>
                <td className="w-8 px-1 py-0 text-center md:py-3 md:align-middle">
                  {item.origem !== "SALDO_INICIAL_CONTA" && (
                    <TransactionActions item={item} onDelete={onDelete} onEdit={onEdit} />
                  )}
                </td>
              </tr>
            ))}
            <tr className="grid grid-cols-[minmax(0,1fr)_auto_2rem] items-start bg-surface-muted py-3 pr-3 pl-4 md:table-row md:p-0">
              <th
                aria-label={`Fechamento ${formatTransactionDate(group.date)}, recebido ${formatCurrency(group.entries)}, gasto ${formatCurrency(group.exits)}`}
                className="min-w-0 p-0 pr-3 text-left md:px-5 md:py-3"
                colSpan={2}
                scope="row"
              >
                <span className="flex flex-col gap-1">
                  <span className="text-caption-strong text-foreground">
                    Fechamento {formatTransactionDate(group.date)}
                  </span>
                  <span className="text-caption wrap-break-word text-foreground">
                    Recebido {formatCurrency(group.entries)} · Gasto {formatCurrency(group.exits)}
                  </span>
                </span>
              </th>
              <td
                aria-label={`Saldo do dia ${formatCurrency(group.balance)}`}
                className="p-0 pr-1 text-right md:py-3 md:pl-5"
              >
                <div className="flex flex-col items-end gap-1">
                  <strong
                    className={`text-caption-strong whitespace-nowrap tabular-nums ${group.balance >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {formatCurrency(group.balance)}
                  </strong>
                  <span className="text-caption text-foreground">Saldo do dia</span>
                </div>
              </td>
              <td aria-hidden="true" className="w-8 px-1 py-0" />
            </tr>
          </tbody>
        ))}
      </table>
    </div>
  );
}
