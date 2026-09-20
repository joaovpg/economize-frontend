import { z } from "zod";

import {
  optionalTransactionTextSchema,
  positiveMoneySchema,
  transactionSituationSchema,
} from "../transactions/shared";

export const criarTransferenciaRequestSchema = z.object({
  contaDestinoId: z.uuid(),
  contaOrigemId: z.uuid(),
  dataFinanceira: z.iso.date(),
  descricao: z.string().trim().min(1).max(255),
  observacoes: optionalTransactionTextSchema,
  situacao: transactionSituationSchema,
  valor: positiveMoneySchema,
});

export const alterarTransferenciaRequestSchema = criarTransferenciaRequestSchema;

export const transferenciaResponseSchema = z.looseObject({
  contaDestinoId: z.uuid(),
  contaOrigemId: z.uuid(),
  dataFinanceira: z.iso.date(),
  descricao: z.string(),
  efetivadoEm: z.iso.datetime().nullable().optional(),
  id: z.uuid(),
  observacoes: z.string().nullable().optional(),
  situacao: transactionSituationSchema,
  valor: z.number(),
});

export type AlterarTransferenciaRequest = z.infer<typeof alterarTransferenciaRequestSchema>;
export type CriarTransferenciaRequest = z.infer<typeof criarTransferenciaRequestSchema>;
export type TransferenciaResponse = z.infer<typeof transferenciaResponseSchema>;
