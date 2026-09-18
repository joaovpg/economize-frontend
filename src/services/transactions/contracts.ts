import { z } from "zod";

import { yearMonthSchema } from "../../lib/transaction-month";

import type { ApiRequestOptions } from "../../lib/api";

export const transactionOriginSchema = z.enum([
  "SALDO_INICIAL_CONTA",
  "TRANSACAO_SIMPLES",
  "TRANSFERENCIA",
  "TRANSACAO_RECORRENTE",
  "PARCELA",
]);

export const transactionTypeSchema = z.enum(["RECEITA", "DESPESA"]);
export const transactionSituationSchema = z.enum(["PLANEJADA", "EFETIVADA"]);
export const transferSituationSchema = z.enum(["PLANEJADA", "EFETIVADA"]);
export const recurrenceGroupTypeSchema = z.enum(["RECORRENCIA", "PARCELAMENTO"]);
export const recurrenceScopeSchema = z.enum(["ONLY_THIS", "THIS_AND_FUTURE"]);
export const recurrenceStatusSchema = z.enum(["ATIVO", "CONCLUIDO", "CANCELADO"]);
export const recurrenceFrequencySchema = z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]);
export const dayOfWeekSchema = z.enum([
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
]);
export const recurrenceDatePolicySchema = z.enum(["PADRAO", "AJUSTAR_ULTIMO_DIA_MES"]);

const positiveMoneySchema = z
  .number()
  .positive()
  .refine((value) => value === Number(value.toFixed(4)), {
    message: "O valor deve ter no máximo quatro casas decimais.",
  });

const optionalTransactionTextSchema = z.string().max(2000).nullable().optional();

export const criarTransacaoRequestSchema = z.object({
  contaId: z.uuid(),
  categoriaId: z.uuid().nullable().optional(),
  situacao: transactionSituationSchema,
  tipo: transactionTypeSchema,
  descricao: z.string().trim().min(1).max(255),
  observacoes: optionalTransactionTextSchema,
  valor: positiveMoneySchema,
  dataFinanceira: z.iso.date(),
});

export const criarTransferenciaRequestSchema = z.object({
  contaOrigemId: z.uuid(),
  contaDestinoId: z.uuid(),
  situacao: transferSituationSchema,
  descricao: z.string().trim().min(1).max(255),
  observacoes: optionalTransactionTextSchema,
  valor: positiveMoneySchema,
  dataFinanceira: z.iso.date(),
});

export const criarRecorrenciaRequestSchema = z.object({
  tipoGrupo: recurrenceGroupTypeSchema,
  contaId: z.uuid(),
  categoriaId: z.uuid().nullable().optional(),
  tipo: transactionTypeSchema,
  descricao: z.string().trim().min(1).max(255),
  observacoes: optionalTransactionTextSchema,
  valor: positiveMoneySchema,
  inicio: z.iso.date(),
  frequencia: recurrenceFrequencySchema,
  intervalo: z.number().int().min(1).optional(),
  diasSemana: z.array(dayOfWeekSchema).optional(),
  diasMes: z.array(z.number().int().min(1).max(31)).optional(),
  quantidadeOcorrencias: z.number().int().min(1).optional(),
  ate: z.iso.date().optional(),
  numeroPrimeiraParcela: z.number().int().min(1).optional(),
  quantidadeTotalOriginal: z.number().int().min(1).optional(),
});

export const alterarTransferenciaRequestSchema = criarTransferenciaRequestSchema;

export const alterarOcorrenciaRecorrenteRequestSchema = z.object({
  escopo: recurrenceScopeSchema,
  contaId: z.uuid(),
  categoriaId: z.uuid().nullable().optional(),
  tipo: transactionTypeSchema,
  descricao: z.string().trim().min(1).max(255),
  observacoes: optionalTransactionTextSchema,
  valor: positiveMoneySchema,
  dataFinanceira: z.iso.date(),
  frequencia: recurrenceFrequencySchema.optional(),
  intervalo: z.number().int().min(1).optional(),
  diasSemana: z.array(dayOfWeekSchema).optional(),
  diasMes: z.array(z.number().int().min(1).max(31)).optional(),
  quantidadeOcorrencias: z.number().int().min(1).optional(),
  ate: z.iso.date().optional(),
  semTermino: z.boolean().optional(),
  quantidadeTotalOriginal: z.number().int().min(1).optional(),
});

export const consultaTransacaoItemSchema = z.looseObject({
  origem: transactionOriginSchema,
  operacaoId: z.uuid().nullable(),
  situacao: transactionSituationSchema.nullable(),
  descricao: z.string(),
  observacoes: z.string().nullable(),
  valor: z.number(),
  dataFinanceira: z.iso.date(),
  efetivadoEm: z.iso.datetime().nullable(),
  contaId: z.uuid(),
  categoriaId: z.uuid().nullable(),
  contaContraparteId: z.uuid().nullable(),
  grupoRecorrenciaId: z.uuid().nullable(),
  segmentoRecorrenciaId: z.uuid().nullable(),
  dataOriginalRecorrencia: z.iso.date().nullable(),
  numeroParcela: z.number().int().nullable(),
  rrule: z.string().nullable(),
  inicioRecorrencia: z.iso.date().nullable(),
  politicaDataOcorrencia: recurrenceDatePolicySchema.nullable(),
});

export const consultaTransacoesResponseSchema = z.looseObject({
  inicio: yearMonthSchema,
  fim: yearMonthSchema,
  saldoAbertura: z.number(),
  itens: z.array(consultaTransacaoItemSchema),
});

export const transacaoResponseSchema = z.looseObject({
  id: z.uuid(),
  tipo: transactionTypeSchema,
  situacao: transactionSituationSchema,
  descricao: z.string(),
  observacoes: z.string().nullable(),
  valor: z.number(),
  dataFinanceira: z.iso.date(),
  efetivadoEm: z.iso.datetime().nullable(),
  contaId: z.uuid(),
  categoriaId: z.uuid().nullable(),
});

export const transferenciaResponseSchema = z.looseObject({
  id: z.uuid(),
  contaOrigemId: z.uuid(),
  contaDestinoId: z.uuid(),
  situacao: transferSituationSchema,
  descricao: z.string(),
  observacoes: z.string().nullable(),
  valor: z.number(),
  dataFinanceira: z.iso.date(),
  efetivadoEm: z.iso.datetime().nullable(),
});

export const recorrenciaResponseSchema = z.looseObject({
  id: z.uuid(),
  grupoId: z.uuid(),
  segmentoId: z.uuid(),
  tipoGrupo: recurrenceGroupTypeSchema,
  status: recurrenceStatusSchema,
  tipo: transactionTypeSchema,
  descricao: z.string(),
  observacoes: z.string().nullable(),
  valor: z.number(),
  inicio: z.iso.date(),
  fim: z.iso.date().nullable(),
  rrule: z.string(),
  totalOcorrencias: z.number().int().nullable(),
  numeroPrimeiraParcela: z.number().int().nullable(),
  quantidadeTotalOriginal: z.number().int().nullable(),
  politicaDataOcorrencia: recurrenceDatePolicySchema,
});

export const recorrenciaOperacaoResponseSchema = z.looseObject({
  id: z.uuid(),
  grupoId: z.uuid(),
  segmentoId: z.uuid(),
  tipoGrupo: recurrenceGroupTypeSchema,
  status: recurrenceStatusSchema,
  tipo: transactionTypeSchema,
  situacao: transactionSituationSchema,
  descricao: z.string(),
  observacoes: z.string().nullable(),
  valor: z.number(),
  dataFinanceira: z.iso.date(),
  efetivadoEm: z.iso.datetime().nullable(),
  contaId: z.uuid(),
  categoriaId: z.uuid().nullable(),
  dataOriginalRecorrencia: z.iso.date(),
  numeroParcela: z.number().int().nullable(),
  rrule: z.string(),
  inicioRecorrencia: z.iso.date(),
  politicaDataOcorrencia: recurrenceDatePolicySchema,
});

export const getTransacoesQuerySchema = z.object({
  inicio: yearMonthSchema,
  fim: yearMonthSchema,
  contaIds: z.array(z.uuid()).optional(),
  categoriaIds: z.array(z.uuid()).optional(),
});

export type ConsultaTransacaoItem = z.infer<typeof consultaTransacaoItemSchema>;
export type ConsultaTransacoesResponse = z.infer<typeof consultaTransacoesResponseSchema>;
export type DayOfWeek = z.infer<typeof dayOfWeekSchema>;
export type CriarTransacaoRequest = z.infer<typeof criarTransacaoRequestSchema>;
export type CriarTransferenciaRequest = z.infer<typeof criarTransferenciaRequestSchema>;
export type CriarRecorrenciaRequest = z.infer<typeof criarRecorrenciaRequestSchema>;
export type AlterarTransferenciaRequest = z.infer<typeof alterarTransferenciaRequestSchema>;
export type AlterarOcorrenciaRecorrenteRequest = z.infer<
  typeof alterarOcorrenciaRecorrenteRequestSchema
>;
export type RecurrenceFrequency = z.infer<typeof recurrenceFrequencySchema>;
export type RecurrenceScope = z.infer<typeof recurrenceScopeSchema>;
export type TransacaoResponse = z.infer<typeof transacaoResponseSchema>;
export type TransferenciaResponse = z.infer<typeof transferenciaResponseSchema>;
export type RecorrenciaResponse = z.infer<typeof recorrenciaResponseSchema>;
export type RecorrenciaOperacaoResponse = z.infer<typeof recorrenciaOperacaoResponseSchema>;
export type TransactionSituation = z.infer<typeof transactionSituationSchema>;
export type TransactionType = z.infer<typeof transactionTypeSchema>;
export type GetTransacoesOptions = ApiRequestOptions & {
  categoriaIds?: readonly string[];
  contaIds?: readonly string[];
  fim: string;
  inicio: string;
};

export type DeleteRecorrenciaOptions = ApiRequestOptions & {
  escopo?: RecurrenceScope;
};
