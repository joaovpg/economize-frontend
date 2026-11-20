import { z } from "zod";

export const transactionTypeSchema = z.enum(["RECEITA", "DESPESA"]);
export const transactionSituationSchema = z.enum(["PLANEJADA", "EFETIVADA"]);

export const positiveMoneySchema = z
  .number()
  .positive()
  .refine((value) => value === Number(value.toFixed(4)), {
    message: "O valor deve ter no máximo quatro casas decimais.",
  });

// Campo anulável obrigatório no contrato: a ausência não é aceita, use null.
export const transactionTextSchema = z.string().max(2000).regex(/\S/).nullable();

// Chave e Versão de edição são valores opacos: validados só quanto a estar presentes.
export const chaveEdicaoSchema = z.string().min(1);
export const versaoEdicaoSchema = z.string().regex(/\S/);

// Limite dos inteiros da repetição no contrato (int32 do backend).
export const inteiroPositivoMaximo = 2_147_483_647;

export type TransactionSituation = z.infer<typeof transactionSituationSchema>;
export type TransactionType = z.infer<typeof transactionTypeSchema>;
