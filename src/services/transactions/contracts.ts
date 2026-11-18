import { z } from "zod";

import { yearMonthSchema } from "../../lib/transaction-month";
import {
  inteiroPositivoMaximo,
  positiveMoneySchema,
  transactionSituationSchema,
  transactionTextSchema,
  transactionTypeSchema,
  versaoEdicaoSchema,
} from "./shared";

import type { ApiRequestOptions } from "../../lib/api";

export const escopoEdicaoTransacaoSchema = z.enum(["SOMENTE_ESTA", "ESTA_E_AS_PROXIMAS"]);
export const frequenciaRepeticaoSchema = z.enum(["DIARIA", "SEMANAL", "MENSAL", "ANUAL"]);
export const ancoragemRepeticaoSchema = z.enum(["DIA_DO_MES", "DIA_UTIL"]);
export const tipoTerminoSchema = z.enum(["INDEFINIDO", "EM_DATA", "APOS_OCORRENCIAS", "PARCELAS"]);

export const transactionOriginSchema = z.enum([
  "SALDO_INICIAL_CONTA",
  "TRANSACAO_SIMPLES",
  "TRANSFERENCIA",
  "TRANSACAO_RECORRENTE",
  "PARCELA",
]);

const inteiroPositivoSchema = z.number().int().min(1).max(inteiroPositivoMaximo);

// Cada tipo de término aceita somente os próprios campos; campos desconhecidos são rejeitados.
export const terminoTransacaoRequestSchema = z.discriminatedUnion("tipo", [
  z.strictObject({ tipo: z.literal("INDEFINIDO") }),
  z.strictObject({ data: z.iso.date(), tipo: z.literal("EM_DATA") }),
  z.strictObject({ quantidade: inteiroPositivoSchema, tipo: z.literal("APOS_OCORRENCIAS") }),
  z.strictObject({
    numeroPrimeiraParcela: inteiroPositivoSchema,
    tipo: z.literal("PARCELAS"),
    totalParcelas: inteiroPositivoSchema,
  }),
]);

export const repeticaoTransacaoRequestSchema = z.strictObject({
  ancoragem: ancoragemRepeticaoSchema,
  frequencia: frequenciaRepeticaoSchema,
  intervalo: inteiroPositivoSchema,
  termino: terminoTransacaoRequestSchema,
});

export const terminoResponseSchema = z.looseObject({
  data: z.iso.date().nullable().optional(),
  numeroPrimeiraParcela: z.number().int().nullable().optional(),
  quantidade: z.number().int().nullable().optional(),
  tipo: tipoTerminoSchema,
  totalParcelas: z.number().int().nullable().optional(),
});

export const repeticaoResponseSchema = z.looseObject({
  ancoragem: ancoragemRepeticaoSchema,
  frequencia: frequenciaRepeticaoSchema,
  intervalo: z.number().int(),
  numeroDiaUtil: z.number().int().nullable().optional(),
  termino: terminoResponseSchema,
});

export const serieResponseSchema = z.looseObject({
  dataOriginal: z.iso.date(),
  grupoId: z.uuid(),
  inicioSegmento: z.iso.date(),
  numeroParcela: z.number().int().nullable().optional(),
  segmentoId: z.uuid(),
  totalParcelas: z.number().int().nullable().optional(),
});

// Campos anuláveis obrigatórios (categoriaId, observacoes, repeticao) são enviados como null.
export const criarTransacaoRequestSchema = z.object({
  categoriaId: z.uuid().nullable(),
  contaId: z.uuid(),
  dataFinanceira: z.iso.date(),
  descricao: z.string().trim().min(1).max(255),
  observacoes: transactionTextSchema,
  repeticao: repeticaoTransacaoRequestSchema.nullable(),
  situacao: transactionSituationSchema,
  tipo: transactionTypeSchema,
  valor: positiveMoneySchema,
});

// `escopo` só existe para ocorrência de série; em transação simples deve ser omitido.
export const alterarTransacaoRequestSchema = criarTransacaoRequestSchema.extend({
  escopo: escopoEdicaoTransacaoSchema.optional(),
  versaoEdicao: versaoEdicaoSchema,
});

export const consultaTransacaoItemSchema = z.looseObject({
  categoriaId: z.uuid().nullable().optional(),
  chaveEdicao: z.string().nullable().optional(),
  chaveItem: z.string(),
  contaContraparteId: z.uuid().nullable().optional(),
  contaId: z.uuid(),
  dataFinanceira: z.iso.date(),
  descricao: z.string(),
  efetivadoEm: z.iso.datetime().nullable().optional(),
  escoposDisponiveis: z.array(escopoEdicaoTransacaoSchema),
  observacoes: z.string().nullable().optional(),
  operacaoId: z.uuid().nullable().optional(),
  origem: transactionOriginSchema,
  protegida: z.boolean().nullable().optional(),
  repeticao: repeticaoResponseSchema.nullable().optional(),
  serie: serieResponseSchema.nullable().optional(),
  situacao: transactionSituationSchema.nullable().optional(),
  tipo: transactionTypeSchema.nullable().optional(),
  valor: z.number(),
  versaoEdicao: z.string().nullable().optional(),
  virtual: z.boolean().nullable().optional(),
});

export const consultaTransacoesResponseSchema = z.looseObject({
  fim: yearMonthSchema,
  inicio: yearMonthSchema,
  itens: z.array(consultaTransacaoItemSchema),
  saldoAbertura: z.number(),
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
export type EscopoEdicaoTransacao = z.infer<typeof escopoEdicaoTransacaoSchema>;
export type RepeticaoTransacaoRequest = z.infer<typeof repeticaoTransacaoRequestSchema>;
export type RepeticaoResponse = z.infer<typeof repeticaoResponseSchema>;
export type SerieResponse = z.infer<typeof serieResponseSchema>;
export type TerminoResponse = z.infer<typeof terminoResponseSchema>;
export type TerminoTransacaoRequest = z.infer<typeof terminoTransacaoRequestSchema>;
export type GetTransacoesOptions = ApiRequestOptions & {
  categoriaIds?: readonly string[];
  contaIds?: readonly string[];
  fim: string;
  inicio: string;
};

export type DeleteTransacaoOptions = ApiRequestOptions & {
  escopo?: EscopoEdicaoTransacao;
  versaoEdicao: string;
};
