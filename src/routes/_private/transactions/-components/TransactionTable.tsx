import { useMemo } from "react";

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

  for (const item of items) {
    balance += item.valor;
    const group = groups.get(item.dataFinanceira);

    if (group) {
      group.balance = balance;
      group.items.push(item);
      continue;
    }

    groups.set(item.dataFinanceira, {
      balance,
      date: item.dataFinanceira,
      items: [item],
    });
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
  year: "numeric",
});

function formatTransactionDate(date: string) {
  return dateFormatter.format(new Date(`${date}T00:00:00Z`));
}

function getItemKey(item: ConsultaTransacaoItem) {
  return `${item.operacaoId ?? item.segmentoRecorrenciaId ?? item.grupoRecorrenciaId ?? "item"}-${item.contaId}-${item.dataFinanceira}-${item.origem}`;
}

export function TransactionTable({
  accounts,
  categories,
  items,
  onDelete,
  onEdit,
  openingBalance,
}: TransactionTableProps) {
  const dayGroups = useMemo(
    () => groupTransactionsByDay(items, openingBalance),
    [items, openingBalance],
  );

  return (
    <div className="min-w-0 overflow-hidden">
      <table className="block w-full border-collapse text-left md:table">
        <caption className="sr-only">Movimentações financeiras agrupadas por dia</caption>
        <thead className="hidden md:table-header-group">
          <tr className="border-b border-border-strong">
            <th
              className="pr-4 pb-3 text-caption-strong tracking-label text-muted uppercase"
              scope="col"
            >
              Descrição
            </th>
            <th
              className="pr-4 pb-3 text-caption-strong tracking-label text-muted uppercase"
              scope="col"
            >
              Categoria
            </th>
            <th
              className="pr-4 pb-3 text-caption-strong tracking-label text-muted uppercase"
              scope="col"
            >
              Conta
            </th>
            <th
              className="pb-3 text-right text-caption-strong tracking-label text-muted uppercase"
              scope="col"
            >
              Valor
            </th>
            <th
              className="pb-3 pl-4 text-right text-caption-strong tracking-label text-muted uppercase"
              scope="col"
            >
              Ações
            </th>
          </tr>
        </thead>
        {dayGroups.map((group, groupIndex) => {
          const balanceClassName = group.balance >= 0 ? "text-success" : "text-danger";

          return (
            <tbody className="grid w-full gap-2.5 md:table-row-group" key={group.date}>
              <tr className="grid w-full md:table-row">
                <th
                  aria-label={`Dia ${formatTransactionDate(group.date)}`}
                  className={`block p-0 text-left text-caption-strong text-foreground md:table-cell md:py-3 ${groupIndex > 0 ? "md:pt-6" : ""}`}
                  colSpan={5}
                  scope="rowgroup"
                >
                  <div
                    className={`flex flex-wrap items-baseline gap-x-4 gap-y-2 py-2.5 md:p-0 ${groupIndex > 0 ? "pt-5" : ""}`}
                  >
                    <time dateTime={group.date}>{formatTransactionDate(group.date)}</time>
                  </div>
                </th>
              </tr>
              {group.items.map((item, itemIndex) => {
                const shouldRenderActions = item.origem !== "SALDO_INICIAL_CONTA";
                const recurring = isRecurringItem(item);
                const valueClassName = item.valor >= 0 ? "text-success" : "text-danger";

                return (
                  <tr
                    className={`grid gap-3 rounded-xl border border-border bg-surface-muted/45 p-3.5 md:table-row md:rounded-none md:border-0 md:border-b md:border-border md:bg-transparent md:p-0 ${itemIndex === group.items.length - 1 ? "md:border-b-0" : ""}`}
                    key={getItemKey(item)}
                  >
                    <td className="flex items-start justify-between gap-4 border-0 p-0 md:table-cell md:max-w-0 md:py-3 md:pr-4 md:align-top">
                      <span className="block text-meta text-subtle uppercase md:hidden">
                        Descrição
                      </span>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-1.5">
                          {recurring && (
                            <span
                              className="inline-flex shrink-0 text-brand"
                              title="Movimento recorrente"
                            >
                              <RepeatIcon aria-hidden="true" />
                              <span className="sr-only">Movimento recorrente</span>
                            </span>
                          )}
                          <span className="truncate text-caption-strong text-foreground">
                            {item.descricao}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="flex items-start justify-between gap-4 border-0 p-0 text-caption text-muted md:table-cell md:py-3 md:pr-4 md:align-top">
                      <span className="block text-meta text-subtle uppercase md:hidden">
                        Categoria
                      </span>
                      <span className="max-w-[60%] text-right md:max-w-none">
                        {getCategoryLabel(item, categories)}
                      </span>
                    </td>
                    <td className="flex items-start justify-between gap-4 border-0 p-0 text-caption text-muted md:table-cell md:py-3 md:pr-4 md:align-top">
                      <span className="block text-meta text-subtle uppercase md:hidden">Conta</span>
                      <span className="max-w-[60%] text-right md:max-w-none">
                        {getAccountLabel(item, accounts)}
                      </span>
                    </td>
                    <td className="flex items-start justify-between gap-4 border-0 p-0 text-right tabular-nums md:table-cell md:py-3 md:align-top">
                      <span className="block text-meta text-subtle uppercase md:hidden">Valor</span>
                      <strong className={`font-semibold whitespace-nowrap ${valueClassName}`}>
                        {formatSignedCurrency(item.valor)}
                      </strong>
                    </td>
                    <td className="flex items-center justify-between gap-4 border-0 p-0 md:table-cell md:py-3 md:pl-4 md:align-top">
                      {shouldRenderActions && (
                        <>
                          <span className="block text-meta text-subtle uppercase md:hidden">
                            Ações
                          </span>
                          <div className="flex justify-end gap-1">
                            <Button
                              aria-label={`Editar transação`}
                              isIconOnly
                              onPress={() => onEdit(item)}
                              size="sm"
                              variant="ghost"
                            >
                              <PencilSimpleIcon aria-hidden="true" />
                            </Button>
                            <Button
                              aria-label={`Excluir transação`}
                              isIconOnly
                              onPress={() => onDelete(item)}
                              size="sm"
                              variant="danger"
                            >
                              <TrashIcon aria-hidden="true" />
                            </Button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="block border-t border-dashed border-border-strong md:table-row">
                <td
                  aria-label={`Saldo do dia ${formatCurrency(group.balance)}`}
                  className="block p-0 text-right md:table-cell md:py-2.5"
                  colSpan={5}
                >
                  <div className="flex items-baseline justify-end gap-2 py-2.5 md:p-0">
                    <span className="text-meta text-subtle uppercase">Saldo do dia</span>
                    <strong className={`whitespace-nowrap tabular-nums ${balanceClassName}`}>
                      {formatCurrency(group.balance)}
                    </strong>
                  </div>
                </td>
              </tr>
            </tbody>
          );
        })}
      </table>
    </div>
  );
}
