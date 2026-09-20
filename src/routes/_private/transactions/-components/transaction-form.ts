import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";

import {
  getCurrentTransactionMonth,
  type TransactionMonth,
} from "../../../../lib/transaction-month";
import {
  type AlterarOcorrenciaRecorrenteRequest,
  type CriarRecorrenciaRequest,
  type DayOfWeek,
  type RecurrenceFrequency,
  type RecurrenceScope,
} from "../../../../services/recurrences/contracts";
import {
  type AlterarTransacaoRequest,
  parseMoneyInput,
  type CriarTransacaoRequest,
  type FormularioEdicaoOperacaoFinanceira,
  type FormularioOperacaoFinanceira,
} from "../../../../services/transactions/contracts";
import { type TransactionType } from "../../../../services/transactions/shared";
import {
  type AlterarTransferenciaRequest,
  type CriarTransferenciaRequest,
} from "../../../../services/transfers/contracts";

const transactionTimeZone = "America/Sao_Paulo";

export const dayOfWeekOptions = [
  { label: "Segunda-feira", shortLabel: "Seg", value: "MONDAY" },
  { label: "Terça-feira", shortLabel: "Ter", value: "TUESDAY" },
  { label: "Quarta-feira", shortLabel: "Qua", value: "WEDNESDAY" },
  { label: "Quinta-feira", shortLabel: "Qui", value: "THURSDAY" },
  { label: "Sexta-feira", shortLabel: "Sex", value: "FRIDAY" },
  { label: "Sábado", shortLabel: "Sáb", value: "SATURDAY" },
  { label: "Domingo", shortLabel: "Dom", value: "SUNDAY" },
] satisfies readonly {
  label: string;
  shortLabel: string;
  value: DayOfWeek;
}[];

export const recurrenceFrequencyOptions = [
  { label: "Todos os dias", value: "DAILY" },
  { label: "Toda semana", value: "WEEKLY" },
  { label: "Todo mês", value: "MONTHLY" },
  { label: "Todo ano", value: "YEARLY" },
] satisfies readonly { label: string; value: RecurrenceFrequency }[];

export const recurrenceEndOptions = [
  { label: "Sem término", value: "none" },
  { label: "Após uma quantidade", value: "count" },
  { label: "Em uma data", value: "until" },
] as const;

export const recurrenceScopeOptions = [
  {
    description: "Altera somente o lançamento escolhido.",
    label: "Somente esta ocorrência",
    value: "ONLY_THIS",
  },
  {
    description: "Altera este lançamento e os próximos do mesmo segmento.",
    label: "Esta e as futuras",
    value: "THIS_AND_FUTURE",
  },
] satisfies readonly {
  description: string;
  label: string;
  value: RecurrenceScope;
}[];

export function isValidFormDate(value: string) {
  return z.iso.date().safeParse(value).success;
}

export function getInitialEntryDate(selectedMonth: TransactionMonth) {
  const currentMonth = getCurrentTransactionMonth();

  return currentMonth.equals(selectedMonth)
    ? getCurrentTransactionDate()
    : selectedMonth.toPlainDate({ day: 1 }).toString();
}

export function getCurrentTransactionDate() {
  return Temporal.Now.zonedDateTimeISO(transactionTimeZone).toPlainDate().toString();
}

export function getDayOfWeekForDate(value: string): DayOfWeek {
  const dayOfWeekByNumber: Record<number, DayOfWeek> = {
    1: "MONDAY",
    2: "TUESDAY",
    3: "WEDNESDAY",
    4: "THURSDAY",
    5: "FRIDAY",
    6: "SATURDAY",
    7: "SUNDAY",
  };

  return dayOfWeekByNumber[Temporal.PlainDate.from(value).dayOfWeek];
}

export function getDayOfWeekOrder(value: DayOfWeek) {
  switch (value) {
    case "MONDAY":
      return 1;
    case "TUESDAY":
      return 2;
    case "WEDNESDAY":
      return 3;
    case "THURSDAY":
      return 4;
    case "FRIDAY":
      return 5;
    case "SATURDAY":
      return 6;
    case "SUNDAY":
      return 7;
    default: {
      const exhaustive: never = value;
      return exhaustive;
    }
  }
}

export function getMonthDayForDate(value: string) {
  return Temporal.PlainDate.from(value).day;
}

export function normalizeOptionalText(value: string) {
  const normalizedValue = value.trim();

  return normalizedValue.length > 0 ? normalizedValue : undefined;
}

export function formatFormDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "UTC",
    year: "numeric",
  }).format(new Date(`${value}T00:00:00Z`));
}

export function formatMoneyForSummary(value: string) {
  const numericValue = parseMoneyInput(value);

  return numericValue === null
    ? "valor não informado"
    : new Intl.NumberFormat("pt-BR", {
        maximumFractionDigits: 4,
        minimumFractionDigits: 2,
      }).format(numericValue);
}

function parseValidatedMoney(value: string) {
  const numericValue = parseMoneyInput(value);

  if (numericValue === null) {
    throw new Error("Valor financeiro inválido após a validação do formulário.");
  }

  return numericValue;
}

function buildSharedRecurrenceFields(data: {
  categoriaId: string | null;
  contaId: string;
  descricao: string;
  observacoes: string;
  tipo: TransactionType;
  valor: string;
}) {
  return {
    categoriaId: data.categoriaId ?? undefined,
    contaId: data.contaId,
    descricao: data.descricao.trim(),
    observacoes: normalizeOptionalText(data.observacoes),
    tipo: data.tipo,
    valor: parseValidatedMoney(data.valor),
  };
}

function requireFormValue<T>(value: T | null | undefined, fieldName: string): T {
  if (value === undefined || value === null || value === "") {
    throw new Error(`O campo ${fieldName} não foi preenchido após a validação.`);
  }

  return value;
}

export function toCreateTransactionRequest(
  data: FormularioOperacaoFinanceira,
): CriarTransacaoRequest {
  if (data.tipoOperacao !== "TRANSACAO") {
    throw new Error("O formulário não representa uma transação.");
  }

  return {
    categoriaId: data.categoriaId ?? undefined,
    contaId: requireFormValue(data.contaId, "contaId"),
    dataFinanceira: data.data,
    descricao: data.descricao.trim(),
    observacoes: normalizeOptionalText(data.observacoes),
    situacao: data.situacao,
    tipo: data.tipo,
    valor: parseValidatedMoney(data.valor),
  };
}

export function toCreateTransferRequest(
  data: FormularioOperacaoFinanceira,
): CriarTransferenciaRequest {
  if (data.tipoOperacao !== "TRANSFERENCIA") {
    throw new Error("O formulário não representa uma transferência.");
  }

  return {
    contaDestinoId: requireFormValue(data.contaDestinoId, "contaDestinoId"),
    contaOrigemId: requireFormValue(data.contaOrigemId, "contaOrigemId"),
    dataFinanceira: data.data,
    descricao: data.descricao.trim(),
    observacoes: normalizeOptionalText(data.observacoes),
    situacao: data.situacao,
    valor: parseValidatedMoney(data.valor),
  };
}

export function toEditTransactionRequest(
  data: FormularioEdicaoOperacaoFinanceira,
): AlterarTransacaoRequest {
  if (data.tipoOperacao !== "TRANSACAO") {
    throw new Error("O formulário não representa uma transação.");
  }

  return {
    categoriaId: data.categoriaId ?? undefined,
    contaId: requireFormValue(data.contaId, "contaId"),
    dataFinanceira: data.data,
    descricao: data.descricao.trim(),
    observacoes: normalizeOptionalText(data.observacoes),
    situacao: data.situacao,
    tipo: data.tipo,
    valor: parseValidatedMoney(data.valor),
  };
}

export function toEditTransferRequest(
  data: FormularioEdicaoOperacaoFinanceira,
): AlterarTransferenciaRequest {
  if (data.tipoOperacao !== "TRANSFERENCIA") {
    throw new Error("O formulário não representa uma transferência.");
  }

  return {
    contaDestinoId: requireFormValue(data.contaDestinoId, "contaDestinoId"),
    contaOrigemId: requireFormValue(data.contaOrigemId, "contaOrigemId"),
    dataFinanceira: data.data,
    descricao: data.descricao.trim(),
    observacoes: normalizeOptionalText(data.observacoes),
    situacao: data.situacao,
    valor: parseValidatedMoney(data.valor),
  };
}

export function toEditRecurrenceOccurrenceRequest(
  data: FormularioEdicaoOperacaoFinanceira,
  escopo: RecurrenceScope,
): AlterarOcorrenciaRecorrenteRequest {
  if (data.tipoOperacao !== "RECORRENCIA" && data.tipoOperacao !== "PARCELAMENTO") {
    throw new Error("O formulário não representa uma recorrência ou parcelamento.");
  }

  return {
    ...buildSharedRecurrenceFields(data),
    dataFinanceira: data.data,
    escopo,
  };
}

export function toCreateRecurrenceRequest(
  data: FormularioOperacaoFinanceira,
): CriarRecorrenciaRequest {
  if (data.tipoOperacao !== "RECORRENCIA") {
    throw new Error("O formulário não representa uma recorrência.");
  }

  const frequency = requireFormValue(data.frequencia, "frequencia");
  const interval = requireFormValue(data.intervalo, "intervalo");
  const request: CriarRecorrenciaRequest = {
    ...buildSharedRecurrenceFields(data),
    diasMes: frequency === "MONTHLY" && data.diasMes.length > 0 ? data.diasMes : undefined,
    diasSemana: frequency === "WEEKLY" && data.diasSemana.length > 0 ? data.diasSemana : undefined,
    frequencia: frequency,
    inicio: data.data,
    intervalo: Number(interval),
    tipoGrupo: "RECORRENCIA",
  };

  if (data.semTermino) {
    return request;
  }

  if (data.quantidadeOcorrencias !== "") {
    return {
      ...request,
      quantidadeOcorrencias: Number(data.quantidadeOcorrencias),
    };
  }

  if (data.ate !== "") {
    return { ...request, ate: data.ate };
  }

  throw new Error("A recorrência precisa ter um término válido.");
}

export function toCreateInstallmentRequest(
  data: FormularioOperacaoFinanceira,
): CriarRecorrenciaRequest {
  if (data.tipoOperacao !== "PARCELAMENTO") {
    throw new Error("O formulário não representa um parcelamento.");
  }

  const interval = requireFormValue(data.intervalo, "intervalo");
  const firstInstallment = requireFormValue(data.numeroPrimeiraParcela, "numeroPrimeiraParcela");
  const totalInstallments = requireFormValue(
    data.quantidadeTotalOriginal,
    "quantidadeTotalOriginal",
  );

  return {
    ...buildSharedRecurrenceFields(data),
    frequencia: "MONTHLY",
    inicio: data.data,
    intervalo: Number(interval),
    numeroPrimeiraParcela: Number(firstInstallment),
    quantidadeTotalOriginal: Number(totalInstallments),
    tipoGrupo: "PARCELAMENTO",
  };
}
