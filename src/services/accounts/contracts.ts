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

export type ContaResponse = z.infer<typeof contaResponseSchema>;
