import { type ConsultaTransacaoItem } from "../../../../services/transactions/contracts";
import { type RecurrenceOccurrenceFormData, type TransferFormData } from "./transaction-form";

type TransactionActionBase = {
  key: string;
};

export type TransferActionTarget = TransactionActionBase & {
  kind: "transfer";
  id: string;
  values: TransferFormData;
};

export type RecurrenceActionTarget = TransactionActionBase & {
  kind: "recurrence";
  dataOriginal: string;
  entryLabel: "parcelamento" | "recorrência";
  segmentoId: string;
  values: RecurrenceOccurrenceFormData;
};

export type TransactionActionTarget = TransferActionTarget | RecurrenceActionTarget;

function getTransactionType(value: number) {
  return value >= 0 ? "RECEITA" : "DESPESA";
}

function getMoneyInputValue(value: number) {
  return Math.abs(value).toString();
}

function getTransferTarget(item: ConsultaTransacaoItem): TransferActionTarget | null {
  const situation = item.situacao;

  if (
    item.origem !== "TRANSFERENCIA" ||
    item.operacaoId === null ||
    item.operacaoId === undefined ||
    item.contaContraparteId === null ||
    item.contaContraparteId === undefined ||
    situation === null ||
    situation === undefined ||
    item.valor === 0
  ) {
    return null;
  }

  const isOrigin = item.valor < 0;
  const values: TransferFormData = {
    contaDestinoId: isOrigin ? item.contaContraparteId : item.contaId,
    contaOrigemId: isOrigin ? item.contaId : item.contaContraparteId,
    dataFinanceira: item.dataFinanceira,
    descricao: item.descricao,
    observacoes: item.observacoes ?? "",
    situacao: situation,
    valor: getMoneyInputValue(item.valor),
  };

  return {
    id: item.operacaoId,
    key: `transfer:${item.operacaoId}`,
    kind: "transfer",
    values,
  };
}

function getRecurrenceTarget(item: ConsultaTransacaoItem): RecurrenceActionTarget | null {
  if (
    (item.origem !== "TRANSACAO_RECORRENTE" && item.origem !== "PARCELA") ||
    item.segmentoRecorrenciaId === null ||
    item.segmentoRecorrenciaId === undefined ||
    item.dataOriginalRecorrencia === null ||
    item.dataOriginalRecorrencia === undefined ||
    item.valor === 0
  ) {
    return null;
  }

  const values: RecurrenceOccurrenceFormData = {
    categoriaId: item.categoriaId ?? null,
    contaId: item.contaId,
    dataFinanceira: item.dataFinanceira,
    descricao: item.descricao,
    observacoes: item.observacoes ?? "",
    tipo: getTransactionType(item.valor),
    valor: getMoneyInputValue(item.valor),
  };

  return {
    dataOriginal: item.dataOriginalRecorrencia,
    entryLabel: item.origem === "PARCELA" ? "parcelamento" : "recorrência",
    key: `recurrence:${item.segmentoRecorrenciaId}:${item.dataOriginalRecorrencia}`,
    kind: "recurrence",
    segmentoId: item.segmentoRecorrenciaId,
    values,
  };
}

export function getTransactionActionTarget(
  item: ConsultaTransacaoItem,
): TransactionActionTarget | null {
  if (item.origem === "TRANSFERENCIA" || item.origem === "TRANSACAO_SIMPLES") {
    return getTransferTarget(item);
  }

  if (item.origem === "TRANSACAO_RECORRENTE" || item.origem === "PARCELA") {
    return getRecurrenceTarget(item);
  }

  return null;
}
