import { z } from "zod";

import {
  optionalTransactionTextSchema,
  positiveMoneySchema,
  recurrenceDatePolicySchema,
  transactionSituationSchema,
  transactionTypeSchema,
} from "../transactions/shared";

import type { ApiRequestOptions } from "../../lib/api";

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

export const criarRecorrenciaRequestSchema = z.object({
  ate: z.iso.date().nullable().optional(),
  categoriaId: z.uuid().nullable().optional(),
  contaId: z.uuid(),
  descricao: z.string().trim().min(1).max(255),
  diasMes: z.array(z.number().int().min(1).max(31)).nullable().optional(),
  diasSemana: z.array(dayOfWeekSchema).nullable().optional(),
  frequencia: recurrenceFrequencySchema,
  inicio: z.iso.date(),
  intervalo: z.number().int().min(1).nullable().optional(),
  numeroPrimeiraParcela: z.number().int().min(1).nullable().optional(),
  observacoes: optionalTransactionTextSchema,
  quantidadeOcorrencias: z.number().int().min(1).nullable().optional(),
  quantidadeTotalOriginal: z.number().int().min(1).nullable().optional(),
  tipo: transactionTypeSchema,
  tipoGrupo: recurrenceGroupTypeSchema,
  valor: positiveMoneySchema,
});

export const alterarOcorrenciaRecorrenteRequestSchema = z.object({
  ate: z.iso.date().nullable().optional(),
  categoriaId: z.uuid().nullable().optional(),
  contaId: z.uuid(),
  dataFinanceira: z.iso.date(),
  descricao: z.string().trim().min(1).max(255),
  diasMes: z.array(z.number().int().min(1).max(31)).nullable().optional(),
  diasSemana: z.array(dayOfWeekSchema).nullable().optional(),
  escopo: recurrenceScopeSchema,
  frequencia: recurrenceFrequencySchema.nullable().optional(),
  intervalo: z.number().int().min(1).nullable().optional(),
  observacoes: optionalTransactionTextSchema,
  quantidadeOcorrencias: z.number().int().min(1).nullable().optional(),
  quantidadeTotalOriginal: z.number().int().min(1).nullable().optional(),
  semTermino: z.boolean().nullable().optional(),
  tipo: transactionTypeSchema,
  valor: positiveMoneySchema,
});

export const recorrenciaResponseSchema = z.looseObject({
  descricao: z.string(),
  fim: z.iso.date().nullable().optional(),
  grupoId: z.uuid(),
  id: z.uuid(),
  inicio: z.iso.date(),
  numeroPrimeiraParcela: z.number().int().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  politicaDataOcorrencia: recurrenceDatePolicySchema,
  quantidadeTotalOriginal: z.number().int().nullable().optional(),
  rrule: z.string(),
  segmentoId: z.uuid(),
  status: recurrenceStatusSchema,
  tipo: transactionTypeSchema,
  tipoGrupo: recurrenceGroupTypeSchema,
  totalOcorrencias: z.number().int().nullable().optional(),
  valor: z.number(),
});

export const recorrenciaOperacaoResponseSchema = z.looseObject({
  categoriaId: z.uuid().nullable().optional(),
  contaId: z.uuid(),
  dataFinanceira: z.iso.date(),
  dataOriginalRecorrencia: z.iso.date(),
  descricao: z.string(),
  efetivadoEm: z.iso.datetime().nullable().optional(),
  grupoId: z.uuid(),
  id: z.uuid().nullable().optional(),
  inicioRecorrencia: z.iso.date(),
  numeroParcela: z.number().int().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  politicaDataOcorrencia: recurrenceDatePolicySchema,
  rrule: z.string(),
  segmentoId: z.uuid(),
  situacao: transactionSituationSchema.nullable().optional(),
  status: recurrenceStatusSchema,
  tipo: transactionTypeSchema,
  tipoGrupo: recurrenceGroupTypeSchema,
  valor: z.number(),
});

export type AlterarOcorrenciaRecorrenteRequest = z.infer<
  typeof alterarOcorrenciaRecorrenteRequestSchema
>;
export type CriarRecorrenciaRequest = z.infer<typeof criarRecorrenciaRequestSchema>;
export type DayOfWeek = z.infer<typeof dayOfWeekSchema>;
export type RecurrenceFrequency = z.infer<typeof recurrenceFrequencySchema>;
export type RecurrenceScope = z.infer<typeof recurrenceScopeSchema>;
export type RecorrenciaResponse = z.infer<typeof recorrenciaResponseSchema>;
export type RecorrenciaOperacaoResponse = z.infer<typeof recorrenciaOperacaoResponseSchema>;

export type DeleteRecorrenciaOptions = ApiRequestOptions & {
  escopo?: RecurrenceScope;
};
