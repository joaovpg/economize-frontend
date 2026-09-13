import { z } from "zod";

import type { ApiRequestOptions } from "../../lib/api";

const yearMonthSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/);

export const transactionOriginSchema = z.enum([
  "SALDO_INICIAL_CONTA",
  "TRANSACAO_SIMPLES",
  "TRANSFERENCIA",
  "TRANSACAO_RECORRENTE",
  "PARCELA",
]);

export const transactionSituationSchema = z.enum(["PLANEJADA", "EFETIVADA"]);
export const recurrenceDatePolicySchema = z.enum(["PADRAO", "AJUSTAR_ULTIMO_DIA_MES"]);

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

export const getTransacoesQuerySchema = z.object({
  inicio: yearMonthSchema,
  fim: yearMonthSchema,
  contaIds: z.array(z.uuid()).optional(),
  categoriaIds: z.array(z.uuid()).optional(),
});

export type ConsultaTransacaoItem = z.infer<typeof consultaTransacaoItemSchema>;
export type ConsultaTransacoesResponse = z.infer<typeof consultaTransacoesResponseSchema>;
export type GetTransacoesOptions = ApiRequestOptions & {
  categoriaIds?: readonly string[];
  contaIds?: readonly string[];
  fim: string;
  inicio: string;
};
