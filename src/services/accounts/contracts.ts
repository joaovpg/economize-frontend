import { z } from "zod";

export const contaResponseSchema = z.looseObject({
  ativo: z.boolean(),
  dataSaldoInicial: z.iso.date(),
  id: z.uuid(),
  moeda: z.string(),
  nome: z.string(),
  saldoInicial: z.number(),
});

export const contasResponseSchema = z.array(contaResponseSchema);

export const cadastrarContaRequestSchema = z.object({
  dataSaldoInicial: z.iso.date(),
  moeda: z.string().trim().length(3).regex(/\S/),
  nome: z.string().trim().min(1).max(120),
  saldoInicial: z.number(),
});

export type ContaResponse = z.infer<typeof contaResponseSchema>;
export type CadastrarContaRequest = z.infer<typeof cadastrarContaRequestSchema>;
