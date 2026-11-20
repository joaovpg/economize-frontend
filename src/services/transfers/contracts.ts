import { z } from "zod";

import {
  positiveMoneySchema,
  transactionSituationSchema,
  transactionTextSchema,
  versaoEdicaoSchema,
} from "../transactions/shared";

// Campos anuláveis obrigatórios (observacoes) são enviados como null.
export const criarTransferenciaRequestSchema = z.object({
  contaDestinoId: z.uuid(),
  contaOrigemId: z.uuid(),
  dataFinanceira: z.iso.date(),
  descricao: z.string().trim().min(1).max(255),
  observacoes: transactionTextSchema,
  situacao: transactionSituationSchema,
  valor: positiveMoneySchema,
});

export const alterarTransferenciaRequestSchema = criarTransferenciaRequestSchema.extend({
  versaoEdicao: versaoEdicaoSchema,
});

export const transferenciaResponseSchema = z.looseObject({
  contaDestinoId: z.uuid(),
  contaOrigemId: z.uuid(),
  dataFinanceira: z.iso.date(),
  descricao: z.string(),
  efetivadoEm: z.iso.datetime().nullable().optional(),
  observacoes: z.string().nullable().optional(),
  situacao: transactionSituationSchema,
  transferenciaId: z.uuid(),
  valor: z.number(),
  versaoEdicao: z.string(),
});

export type AlterarTransferenciaRequest = z.infer<typeof alterarTransferenciaRequestSchema>;
export type CriarTransferenciaRequest = z.infer<typeof criarTransferenciaRequestSchema>;
export type TransferenciaResponse = z.infer<typeof transferenciaResponseSchema>;
