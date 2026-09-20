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
  dayOfWeekSchema,
  recurrenceFrequencySchema,
} from "../../../../services/recurrences/contracts";
import { type CriarTransacaoRequest } from "../../../../services/transactions/contracts";
import {
  transactionSituationSchema,
  transactionTypeSchema,
  type TransactionSituation,
  type TransactionType,
} from "../../../../services/transactions/shared";
import {
  type AlterarTransferenciaRequest,
  type CriarTransferenciaRequest,
} from "../../../../services/transfers/contracts";

const transactionTimeZone = "America/Sao_Paulo";

export const transactionEntryModeSchema = z.enum([
  "transaction",
  "transfer",
  "recurrence",
  "installment",
]);

export type TransactionEntryMode = z.infer<typeof transactionEntryModeSchema>;

export const transactionEntryModeOptions = [
  {
    description: "Uma receita ou despesa única.",
    label: "Transação",
    value: "transaction",
  },
  {
    description: "Movimente valores entre duas contas.",
    label: "Transferência",
    value: "transfer",
  },
  {
    description: "Repita o mesmo movimento ao longo do tempo.",
    label: "Recorrência",
    value: "recurrence",
  },
  {
    description: "Divida uma compra em parcelas numeradas.",
    label: "Parcelamento",
    value: "installment",
  },
] satisfies readonly {
  description: string;
  label: string;
  value: TransactionEntryMode;
}[];

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

type RecurrenceEndType = (typeof recurrenceEndOptions)[number]["value"];

const isoDateSchema = z
  .string()
  .min(1, "Informe uma data.")
  .refine((value) => z.iso.date().safeParse(value).success, "Informe uma data válida.");

export function isValidFormDate(value: string) {
  return z.iso.date().safeParse(value).success;
}

const positiveIntegerInputSchema = z
  .string()
  .trim()
  .min(1, "Informe um número.")
  .regex(/^\d+$/, "Informe um número inteiro positivo.")
  .refine(
    (value) => Number(value) > 0 && Number(value) <= 2_147_483_647,
    "Informe um número válido.",
  );

function normalizeMoneyInput(value: string) {
  const compactValue = value.trim().replace(/\s/g, "");

  if (compactValue.includes(",") && compactValue.includes(".")) {
    return compactValue.lastIndexOf(",") > compactValue.lastIndexOf(".")
      ? compactValue.replace(/\./g, "").replace(",", ".")
      : compactValue.replace(/,/g, "");
  }

  return compactValue.replace(",", ".");
}

export function parseMoneyInput(value: string): number | null {
  const normalizedValue = normalizeMoneyInput(value);

  if (!/^\d+(\.\d{1,4})?$/.test(normalizedValue)) {
    return null;
  }

  const numericValue = Number(normalizedValue);

  return Number.isFinite(numericValue) && numericValue > 0 ? numericValue : null;
}

const moneyInputSchema = z
  .string()
  .trim()
  .min(1, "Informe o valor.")
  .refine(
    (value) => parseMoneyInput(value) !== null,
    "Informe um valor positivo com até quatro casas decimais.",
  );

const uuidInputSchema = (message: string) =>
  z
    .string()
    .min(1, message)
    .refine((value) => z.uuid().safeParse(value).success, "Selecione uma opção válida.");

const optionalCategorySchema = z.uuid().nullable();
const descriptionSchema = z
  .string()
  .trim()
  .min(1, "Informe a descrição.")
  .max(255, "Use no máximo 255 caracteres.");
const observationsSchema = z.string().max(2000, "Use no máximo 2.000 caracteres.");

const dateEndSchema = z.discriminatedUnion("kind", [
  z.object({ kind: z.literal("none") }),
  z.object({ kind: z.literal("count"), value: positiveIntegerInputSchema }),
  z.object({ kind: z.literal("until"), value: isoDateSchema }),
]);

function isFutureDate(value: string) {
  return value > getCurrentTransactionDate();
}

function addEffectiveDateIssue(
  data: { dataFinanceira: string; situacao: TransactionSituation },
  context: z.RefinementCtx,
) {
  if (data.situacao === "EFETIVADA" && isFutureDate(data.dataFinanceira)) {
    context.addIssue({
      code: "custom",
      message: "Uma transação efetivada não pode ter data futura.",
      path: ["dataFinanceira"],
    });
  }
}

const financialFields = {
  categoriaId: optionalCategorySchema,
  descricao: descriptionSchema,
  observacoes: observationsSchema,
  tipo: transactionTypeSchema,
  valor: moneyInputSchema,
};
export const transactionBaseFormSchema = z.object({});

export const transactionFormSchema = z
  .object({
    ...financialFields,
    contaId: uuidInputSchema("Selecione uma conta."),
    dataFinanceira: isoDateSchema,
    situacao: transactionSituationSchema,
  })
  .superRefine(addEffectiveDateIssue);

export type TransactionFormData = z.infer<typeof transactionFormSchema>;

export const transferFormSchema = z
  .object({
    contaDestinoId: uuidInputSchema("Selecione a conta de destino."),
    contaOrigemId: uuidInputSchema("Selecione a conta de origem."),
    dataFinanceira: isoDateSchema,
    descricao: descriptionSchema,
    observacoes: observationsSchema,
    situacao: transactionSituationSchema,
    valor: moneyInputSchema,
  })
  .superRefine((data, context) => {
    if (data.contaOrigemId === data.contaDestinoId) {
      context.addIssue({
        code: "custom",
        message: "Escolha contas diferentes.",
        path: ["contaDestinoId"],
      });
    }

    addEffectiveDateIssue(data, context);
  });

export type TransferFormData = z.infer<typeof transferFormSchema>;

export const recurrenceFormSchema = z
  .object({
    ...financialFields,
    contaId: uuidInputSchema("Selecione uma conta."),
    diasMes: z.array(z.number().int().min(1).max(31)),
    diasSemana: z.array(dayOfWeekSchema),
    frequencia: recurrenceFrequencySchema,
    inicio: isoDateSchema,
    intervalo: positiveIntegerInputSchema,
    termino: dateEndSchema,
  })
  .superRefine((data, context) => {
    if (!isValidFormDate(data.inicio)) {
      return;
    }

    const initialWeekday = getDayOfWeekForDate(data.inicio);
    const initialWeekdayOrder = getDayOfWeekOrder(initialWeekday);

    if (data.frequencia === "DAILY" || data.frequencia === "YEARLY") {
      if (data.diasSemana.length > 0) {
        context.addIssue({
          code: "custom",
          message: "Não selecione dias da semana para esta frequência.",
          path: ["diasSemana"],
        });
      }
      if (data.diasMes.length > 0) {
        context.addIssue({
          code: "custom",
          message: "Não selecione dias do mês para esta frequência.",
          path: ["diasMes"],
        });
      }
    }

    if (data.frequencia === "WEEKLY") {
      if (data.diasSemana.length === 0) {
        context.addIssue({
          code: "custom",
          message: "Selecione ao menos um dia da semana.",
          path: ["diasSemana"],
        });
      }
      if (!data.diasSemana.includes(initialWeekday)) {
        context.addIssue({
          code: "custom",
          message: "Inclua o dia da data inicial na recorrência.",
          path: ["diasSemana"],
        });
      }
      if (data.diasSemana.some((day) => getDayOfWeekOrder(day) < initialWeekdayOrder)) {
        context.addIssue({
          code: "custom",
          message: "O dia inicial deve ser a primeira ocorrência da semana.",
          path: ["diasSemana"],
        });
      }
    }

    if (data.frequencia === "MONTHLY") {
      const initialMonthDay = getMonthDayForDate(data.inicio);

      if (data.diasMes.length === 0) {
        context.addIssue({
          code: "custom",
          message: "Selecione ao menos um dia do mês.",
          path: ["diasMes"],
        });
      }
      if (!data.diasMes.includes(initialMonthDay)) {
        context.addIssue({
          code: "custom",
          message: "Inclua o dia da data inicial na recorrência.",
          path: ["diasMes"],
        });
      }
      if (data.diasMes.some((day) => day < initialMonthDay)) {
        context.addIssue({
          code: "custom",
          message: "O dia inicial deve ser a primeira ocorrência do mês.",
          path: ["diasMes"],
        });
      }
    }

    if (data.termino.kind === "until" && data.termino.value < data.inicio) {
      context.addIssue({
        code: "custom",
        message: "A data final não pode ser anterior à data inicial.",
        path: ["termino"],
      });
    }
  });

export type RecurrenceFormData = z.infer<typeof recurrenceFormSchema>;

export const recurrenceOccurrenceFormSchema = z.object({
  ...financialFields,
  contaId: uuidInputSchema("Selecione uma conta."),
  dataFinanceira: isoDateSchema,
});

export type RecurrenceOccurrenceFormData = z.infer<typeof recurrenceOccurrenceFormSchema>;

export const installmentFormSchema = z
  .object({
    ...financialFields,
    contaId: uuidInputSchema("Selecione uma conta."),
    inicio: isoDateSchema,
    intervalo: positiveIntegerInputSchema,
    numeroPrimeiraParcela: positiveIntegerInputSchema,
    quantidadeTotalOriginal: positiveIntegerInputSchema,
  })
  .superRefine((data, context) => {
    if (Number(data.quantidadeTotalOriginal) < Number(data.numeroPrimeiraParcela)) {
      context.addIssue({
        code: "custom",
        message: "A quantidade total deve ser maior ou igual à primeira parcela.",
        path: ["quantidadeTotalOriginal"],
      });
    }
  });

export type InstallmentFormData = z.infer<typeof installmentFormSchema>;

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

export function getTransactionTypeLabel(value: TransactionType) {
  return value === "RECEITA" ? "Receita" : "Despesa";
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

export function toCreateTransactionRequest(data: TransactionFormData): CriarTransacaoRequest {
  return {
    categoriaId: data.categoriaId ?? undefined,
    contaId: data.contaId,
    dataFinanceira: data.dataFinanceira,
    descricao: data.descricao.trim(),
    observacoes: normalizeOptionalText(data.observacoes),
    situacao: data.situacao,
    tipo: data.tipo,
    valor: parseValidatedMoney(data.valor),
  };
}

export function toCreateTransferRequest(data: TransferFormData): CriarTransferenciaRequest {
  return {
    contaDestinoId: data.contaDestinoId,
    contaOrigemId: data.contaOrigemId,
    dataFinanceira: data.dataFinanceira,
    descricao: data.descricao.trim(),
    observacoes: normalizeOptionalText(data.observacoes),
    situacao: data.situacao,
    valor: parseValidatedMoney(data.valor),
  };
}

export function toEditTransferRequest(data: TransferFormData): AlterarTransferenciaRequest {
  return toCreateTransferRequest(data);
}

export function toEditRecurrenceOccurrenceRequest(
  data: RecurrenceOccurrenceFormData,
  escopo: RecurrenceScope,
): AlterarOcorrenciaRecorrenteRequest {
  return {
    ...buildSharedRecurrenceFields(data),
    dataFinanceira: data.dataFinanceira,
    escopo,
  };
}

export function toCreateRecurrenceRequest(data: RecurrenceFormData): CriarRecorrenciaRequest {
  const request: CriarRecorrenciaRequest = {
    ...buildSharedRecurrenceFields(data),
    diasMes: data.frequencia === "MONTHLY" && data.diasMes.length > 0 ? data.diasMes : undefined,
    diasSemana:
      data.frequencia === "WEEKLY" && data.diasSemana.length > 0 ? data.diasSemana : undefined,
    frequencia: data.frequencia,
    inicio: data.inicio,
    intervalo: Number(data.intervalo),
    tipoGrupo: "RECORRENCIA",
  };

  switch (data.termino.kind) {
    case "count":
      return { ...request, quantidadeOcorrencias: Number(data.termino.value) };
    case "none":
      return request;
    case "until":
      return { ...request, ate: data.termino.value };
    default: {
      const exhaustive: never = data.termino;
      return exhaustive;
    }
  }
}

export function toCreateInstallmentRequest(data: InstallmentFormData): CriarRecorrenciaRequest {
  return {
    ...buildSharedRecurrenceFields(data),
    frequencia: "MONTHLY",
    inicio: data.inicio,
    intervalo: Number(data.intervalo),
    numeroPrimeiraParcela: Number(data.numeroPrimeiraParcela),
    quantidadeTotalOriginal: Number(data.quantidadeTotalOriginal),
    tipoGrupo: "PARCELAMENTO",
  };
}

export function getEntryModeLabel(mode: TransactionEntryMode) {
  return (
    transactionEntryModeOptions.find((option) => option.value === mode)?.label ?? "Movimentação"
  );
}

export function getRecurrenceEndTypeLabel(value: RecurrenceEndType) {
  return recurrenceEndOptions.find((option) => option.value === value)?.label ?? "Sem término";
}

export function getFormSubmitLabel(mode: TransactionEntryMode) {
  switch (mode) {
    case "transaction":
      return "Cadastrar transação";
    case "transfer":
      return "Cadastrar transferência";
    case "recurrence":
      return "Cadastrar recorrência";
    case "installment":
      return "Cadastrar parcelamento";
    default: {
      const exhaustive: never = mode;
      return exhaustive;
    }
  }
}
