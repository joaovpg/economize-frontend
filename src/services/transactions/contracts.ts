import { Temporal } from "@js-temporal/polyfill";
import { z } from "zod";

import { yearMonthSchema } from "../../lib/transaction-month";
import { dayOfWeekSchema, recurrenceFrequencySchema } from "../recurrences/contracts";
import {
  optionalTransactionTextSchema,
  positiveMoneySchema,
  recurrenceDatePolicySchema,
  transactionSituationSchema,
  transactionTypeSchema,
} from "./shared";

import type { ApiRequestOptions } from "../../lib/api";

const transactionTimeZone = "America/Sao_Paulo";

const formDateSchema = z
  .string()
  .min(1, "Informe uma data.")
  .refine((value) => z.iso.date().safeParse(value).success, "Informe uma data válida.");

const positiveIntegerInputSchema = z
  .string()
  .trim()
  .min(1, "Informe um número.")
  .regex(/^\d+$/, "Informe um número inteiro positivo.")
  .refine(
    (value) => Number(value) > 0 && Number(value) <= 2_147_483_647,
    "Informe um número válido.",
  );

const optionalPositiveIntegerInputSchema = z.union([z.literal(""), positiveIntegerInputSchema]);
const optionalDateInputSchema = z.union([z.literal(""), formDateSchema]);

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

const formularioTipoOperacaoSchema = z.enum([
  "TRANSACAO",
  "TRANSFERENCIA",
  "RECORRENCIA",
  "PARCELAMENTO",
]);

export type FormularioTipoOperacao = z.infer<typeof formularioTipoOperacaoSchema>;

function getCurrentTransactionDate() {
  return Temporal.Now.zonedDateTimeISO(transactionTimeZone).toPlainDate().toString();
}

const formularioOperacaoFinanceiraBaseShape = {
  categoriaId: z.uuid().nullable(),
  contaDestinoId: z.string(),
  contaId: z.string(),
  contaOrigemId: z.string(),
  data: formDateSchema,
  descricao: z.string().trim().min(1, "Informe a descrição.").max(255),
  observacoes: z.string().max(2000),
  situacao: transactionSituationSchema,
  tipo: transactionTypeSchema,
  tipoOperacao: formularioTipoOperacaoSchema,
  valor: moneyInputSchema,
};

const formularioOperacaoFinanceiraBaseSchema = z.object(formularioOperacaoFinanceiraBaseShape);

type FormularioOperacaoFinanceiraBase = z.infer<typeof formularioOperacaoFinanceiraBaseSchema>;

function addRequiredOperationFieldIssue(
  contexto: z.RefinementCtx,
  campo: string,
  valor: unknown,
  mensagem: string,
) {
  if (valor === undefined || valor === null || valor === "") {
    contexto.addIssue({ code: "custom", message: mensagem, path: [campo] });
  }
}

function validateOperationBase(
  formulario: FormularioOperacaoFinanceiraBase,
  contexto: z.RefinementCtx,
) {
  if (formulario.tipoOperacao === "TRANSFERENCIA") {
    addRequiredOperationFieldIssue(
      contexto,
      "contaOrigemId",
      formulario.contaOrigemId,
      "Selecione a conta de origem.",
    );
    addRequiredOperationFieldIssue(
      contexto,
      "contaDestinoId",
      formulario.contaDestinoId,
      "Selecione a conta de destino.",
    );

    if (
      formulario.contaOrigemId &&
      formulario.contaDestinoId &&
      formulario.contaOrigemId === formulario.contaDestinoId
    ) {
      contexto.addIssue({
        code: "custom",
        message: "Escolha contas diferentes.",
        path: ["contaDestinoId"],
      });
    }
  } else {
    addRequiredOperationFieldIssue(contexto, "contaId", formulario.contaId, "Selecione uma conta.");
  }

  if (
    (formulario.tipoOperacao === "TRANSACAO" || formulario.tipoOperacao === "TRANSFERENCIA") &&
    formulario.situacao === "EFETIVADA" &&
    formulario.data > getCurrentTransactionDate()
  ) {
    contexto.addIssue({
      code: "custom",
      message: "Uma transação efetivada não pode ter data futura.",
      path: ["data"],
    });
  }
}

export const formularioOperacaoFinanceiraSchema = z
  .object({
    ate: optionalDateInputSchema,
    diasMes: z.array(z.number().int().min(1).max(31)),
    diasSemana: z.array(dayOfWeekSchema),
    frequencia: recurrenceFrequencySchema.nullable(),
    intervalo: optionalPositiveIntegerInputSchema,
    numeroPrimeiraParcela: optionalPositiveIntegerInputSchema,
    quantidadeOcorrencias: optionalPositiveIntegerInputSchema,
    quantidadeTotalOriginal: optionalPositiveIntegerInputSchema,
    semTermino: z.boolean(),
    ...formularioOperacaoFinanceiraBaseShape,
  })
  .superRefine((formulario, contexto) => {
    validateOperationBase(formulario, contexto);

    if (formulario.tipoOperacao === "RECORRENCIA") {
      addRequiredOperationFieldIssue(
        contexto,
        "frequencia",
        formulario.frequencia,
        "Selecione uma frequência.",
      );
      addRequiredOperationFieldIssue(
        contexto,
        "intervalo",
        formulario.intervalo,
        "Informe o intervalo.",
      );

      if (formulario.frequencia && z.iso.date().safeParse(formulario.data).success) {
        const initialDate = new Date(`${formulario.data}T00:00:00Z`);
        const initialWeekday = initialDate.getUTCDay();
        const initialMonthDay = initialDate.getUTCDate();

        if (formulario.frequencia === "DAILY" || formulario.frequencia === "YEARLY") {
          if (formulario.diasSemana.length > 0) {
            contexto.addIssue({
              code: "custom",
              message: "Não selecione dias da semana para esta frequência.",
              path: ["diasSemana"],
            });
          }
          if (formulario.diasMes.length > 0) {
            contexto.addIssue({
              code: "custom",
              message: "Não selecione dias do mês para esta frequência.",
              path: ["diasMes"],
            });
          }
        }

        if (formulario.frequencia === "WEEKLY") {
          if (formulario.diasSemana.length === 0) {
            contexto.addIssue({
              code: "custom",
              message: "Selecione ao menos um dia da semana.",
              path: ["diasSemana"],
            });
          }

          const initialDayOfWeek = initialWeekday === 0 ? 7 : initialWeekday;
          const selectedWeekdayNumbers = formulario.diasSemana.map((day) =>
            day === "SUNDAY"
              ? 7
              : ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"].indexOf(day) +
                1,
          );

          if (!selectedWeekdayNumbers.includes(initialDayOfWeek)) {
            contexto.addIssue({
              code: "custom",
              message: "Inclua o dia da data inicial na recorrência.",
              path: ["diasSemana"],
            });
          }
          if (selectedWeekdayNumbers.some((day) => day < initialDayOfWeek)) {
            contexto.addIssue({
              code: "custom",
              message: "O dia inicial deve ser a primeira ocorrência da semana.",
              path: ["diasSemana"],
            });
          }
        }

        if (formulario.frequencia === "MONTHLY") {
          if (formulario.diasMes.length === 0) {
            contexto.addIssue({
              code: "custom",
              message: "Selecione ao menos um dia do mês.",
              path: ["diasMes"],
            });
          }
          if (!formulario.diasMes.includes(initialMonthDay)) {
            contexto.addIssue({
              code: "custom",
              message: "Inclua o dia da data inicial na recorrência.",
              path: ["diasMes"],
            });
          }
          if (formulario.diasMes.some((day) => day < initialMonthDay)) {
            contexto.addIssue({
              code: "custom",
              message: "O dia inicial deve ser a primeira ocorrência do mês.",
              path: ["diasMes"],
            });
          }
        }
      }

      if (formulario.semTermino) {
        if (formulario.ate !== "" || formulario.quantidadeOcorrencias !== "") {
          contexto.addIssue({
            code: "custom",
            message: "Remova o término antes de escolher uma recorrência sem fim.",
            path: ["ate"],
          });
        }
      } else {
        const hasEndDate = formulario.ate !== "";
        const hasOccurrenceCount = formulario.quantidadeOcorrencias !== "";

        if (!hasEndDate && !hasOccurrenceCount) {
          contexto.addIssue({
            code: "custom",
            message: "Informe a quantidade de ocorrências ou a data final.",
            path: ["ate"],
          });
        }
        if (hasEndDate && hasOccurrenceCount) {
          contexto.addIssue({
            code: "custom",
            message: "Escolha apenas uma forma de término.",
            path: ["ate"],
          });
        }
        if (
          formulario.ate !== "" &&
          z.iso.date().safeParse(formulario.ate).success &&
          formulario.ate < formulario.data
        ) {
          contexto.addIssue({
            code: "custom",
            message: "A data final não pode ser anterior à data inicial.",
            path: ["ate"],
          });
        }
      }
    }

    if (formulario.tipoOperacao === "PARCELAMENTO") {
      addRequiredOperationFieldIssue(
        contexto,
        "intervalo",
        formulario.intervalo,
        "Informe o intervalo.",
      );
      addRequiredOperationFieldIssue(
        contexto,
        "numeroPrimeiraParcela",
        formulario.numeroPrimeiraParcela,
        "Informe o número inicial.",
      );
      addRequiredOperationFieldIssue(
        contexto,
        "quantidadeTotalOriginal",
        formulario.quantidadeTotalOriginal,
        "Informe o total de parcelas.",
      );

      if (
        formulario.numeroPrimeiraParcela !== "" &&
        formulario.quantidadeTotalOriginal !== "" &&
        Number(formulario.quantidadeTotalOriginal) < Number(formulario.numeroPrimeiraParcela)
      ) {
        contexto.addIssue({
          code: "custom",
          message: "O total de parcelas deve ser maior ou igual ao número inicial.",
          path: ["quantidadeTotalOriginal"],
        });
      }
    }
  });

export type FormularioOperacaoFinanceira = z.infer<typeof formularioOperacaoFinanceiraSchema>;

export const formularioEdicaoOperacaoFinanceiraSchema =
  formularioOperacaoFinanceiraBaseSchema.superRefine(validateOperationBase);

export type FormularioEdicaoOperacaoFinanceira = z.infer<
  typeof formularioEdicaoOperacaoFinanceiraSchema
>;

export const transactionOriginSchema = z.enum([
  "SALDO_INICIAL_CONTA",
  "TRANSACAO_SIMPLES",
  "TRANSFERENCIA",
  "TRANSACAO_RECORRENTE",
  "PARCELA",
]);

export const criarTransacaoRequestSchema = z.object({
  categoriaId: z.uuid().nullable().optional(),
  contaId: z.uuid(),
  dataFinanceira: z.iso.date(),
  descricao: z.string().trim().min(1).max(255),
  observacoes: optionalTransactionTextSchema,
  situacao: transactionSituationSchema,
  tipo: transactionTypeSchema,
  valor: positiveMoneySchema,
});

export const alterarTransacaoRequestSchema = criarTransacaoRequestSchema;

export const consultaTransacaoItemSchema = z.looseObject({
  categoriaId: z.uuid().nullable().optional(),
  contaContraparteId: z.uuid().nullable().optional(),
  contaId: z.uuid(),
  dataFinanceira: z.iso.date(),
  dataOriginalRecorrencia: z.iso.date().nullable().optional(),
  descricao: z.string(),
  efetivadoEm: z.iso.datetime().nullable().optional(),
  grupoRecorrenciaId: z.uuid().nullable().optional(),
  inicioRecorrencia: z.iso.date().nullable().optional(),
  numeroParcela: z.number().int().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  operacaoId: z.uuid().nullable().optional(),
  origem: transactionOriginSchema,
  politicaDataOcorrencia: recurrenceDatePolicySchema.nullable().optional(),
  rrule: z.string().nullable().optional(),
  segmentoRecorrenciaId: z.uuid().nullable().optional(),
  situacao: transactionSituationSchema.nullable().optional(),
  valor: z.number(),
});

export const consultaTransacoesResponseSchema = z.looseObject({
  fim: yearMonthSchema,
  inicio: yearMonthSchema,
  itens: z.array(consultaTransacaoItemSchema),
  saldoAbertura: z.number(),
});

export const transacaoResponseSchema = z.looseObject({
  categoriaId: z.uuid().nullable().optional(),
  contaId: z.uuid(),
  dataFinanceira: z.iso.date(),
  descricao: z.string(),
  efetivadoEm: z.iso.datetime().nullable().optional(),
  id: z.uuid(),
  observacoes: z.string().nullable().optional(),
  situacao: transactionSituationSchema,
  tipo: transactionTypeSchema,
  valor: z.number(),
});

export const getTransacoesQuerySchema = z.object({
  categoriaIds: z.array(z.uuid()).optional(),
  contaIds: z.array(z.uuid()).optional(),
  fim: yearMonthSchema,
  inicio: yearMonthSchema,
});

export type ConsultaTransacaoItem = z.infer<typeof consultaTransacaoItemSchema>;
export type ConsultaTransacoesResponse = z.infer<typeof consultaTransacoesResponseSchema>;
export type AlterarTransacaoRequest = z.infer<typeof alterarTransacaoRequestSchema>;
export type CriarTransacaoRequest = z.infer<typeof criarTransacaoRequestSchema>;
export type TransacaoResponse = z.infer<typeof transacaoResponseSchema>;
export type GetTransacoesOptions = ApiRequestOptions & {
  categoriaIds?: readonly string[];
  contaIds?: readonly string[];
  fim: string;
  inicio: string;
};
