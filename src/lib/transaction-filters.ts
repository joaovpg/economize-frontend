import { z } from "zod";

import { getCurrentYearMonth, yearMonthSchema } from "./transaction-month";

export const allAccountsFilterValue = "Todas as contas";
export const categoryFilterValueSchema = z.uuid();
export const accountFilterValueSchema = z.union([z.uuid(), z.literal(allAccountsFilterValue)]);

export { getMonthLabel } from "./transaction-month";

const transactionSearchShape = {
  accounts: z
    .array(accountFilterValueSchema)
    .catch([allAccountsFilterValue])
    .default([allAccountsFilterValue]),
  categories: z.array(categoryFilterValueSchema).catch([]).default([]),
  includePreviousBalance: z.boolean().catch(true).default(true),
  month: yearMonthSchema.catch(getCurrentYearMonth).default(getCurrentYearMonth),
  q: z.string().catch("").default(""),
};

export const transactionSearchSchema = z.object(transactionSearchShape);
export const summarySearchSchema = transactionSearchSchema.extend({
  ledgerExpanded: z.boolean().catch(true).default(true),
});

export const transactionFilterFormSchema = z.object({
  accounts: z.array(accountFilterValueSchema),
  categories: z.array(categoryFilterValueSchema),
  includePreviousBalance: z.boolean(),
  month: yearMonthSchema,
  search: z.string(),
});

export type AccountFilterValue = z.infer<typeof accountFilterValueSchema>;
export type TransactionFilterFormData = z.infer<typeof transactionFilterFormSchema>;
export type TransactionSearch = z.infer<typeof transactionSearchSchema>;
export type SummarySearch = z.infer<typeof summarySearchSchema>;
export type TransactionFilterState = Pick<
  TransactionSearch,
  "accounts" | "categories" | "includePreviousBalance" | "month" | "q"
>;
