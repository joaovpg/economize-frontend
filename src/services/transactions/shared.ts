import { z } from "zod";

export const transactionTypeSchema = z.enum(["RECEITA", "DESPESA"]);
export const transactionSituationSchema = z.enum(["PLANEJADA", "EFETIVADA"]);
export const recurrenceDatePolicySchema = z.enum(["PADRAO", "AJUSTAR_ULTIMO_DIA_MES"]);

export const positiveMoneySchema = z
  .number()
  .positive()
  .refine((value) => value === Number(value.toFixed(4)), {
    message: "O valor deve ter no máximo quatro casas decimais.",
  });

export const optionalTransactionTextSchema = z.string().max(2000).nullable().optional();

export type TransactionSituation = z.infer<typeof transactionSituationSchema>;
export type TransactionType = z.infer<typeof transactionTypeSchema>;
