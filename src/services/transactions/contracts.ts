import { z } from "zod";

import { yearMonthSchema } from "../../lib/transaction-month";
import {
  optionalTransactionTextSchema,
  positiveMoneySchema,
  recurrenceDatePolicySchema,
  transactionSituationSchema,
  transactionTypeSchema,
} from "./shared";

import type { ApiRequestOptions } from "../../lib/api";

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
export type CriarTransacaoRequest = z.infer<typeof criarTransacaoRequestSchema>;
export type TransacaoResponse = z.infer<typeof transacaoResponseSchema>;
export type GetTransacoesOptions = ApiRequestOptions & {
  categoriaIds?: readonly string[];
  contaIds?: readonly string[];
  fim: string;
  inicio: string;
};
