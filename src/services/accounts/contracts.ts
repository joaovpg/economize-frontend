import { z } from "zod";

export const contaResponseSchema = z.looseObject({
  id: z.uuid(),
  nome: z.string(),
  moeda: z.string(),
  saldoInicial: z.number(),
  dataSaldoInicial: z.iso.date(),
  ativo: z.boolean(),
});

export const contasResponseSchema = z.array(contaResponseSchema);

export type ContaResponse = z.infer<typeof contaResponseSchema>;
