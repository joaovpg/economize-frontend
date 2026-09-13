import { z } from "zod";

export const allAccountsFilterValue = "Todas as contas";
export const categoryFilterValueSchema = z.uuid();
export const accountFilterValueSchema = z.union([z.uuid(), z.literal(allAccountsFilterValue)]);

export const transactionMonthValues = ["2026-09", "2026-08"] as const;

export const monthOptions = [
  { label: "Setembro 2026", value: "2026-09" },
  { label: "Agosto 2026", value: "2026-08" },
] as const satisfies readonly { label: string; value: TransactionMonth }[];

export function getMonthLabel(month: string) {
  return monthOptions.find((option) => option.value === month)?.label ?? month;
}

const transactionSearchShape = {
  accounts: z
    .array(accountFilterValueSchema)
    .catch([allAccountsFilterValue])
    .default([allAccountsFilterValue]),
  categories: z.array(categoryFilterValueSchema).catch([]).default([]),
  includePreviousBalance: z.boolean().catch(true).default(true),
  month: z.enum(transactionMonthValues).catch("2026-09").default("2026-09"),
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
  month: z.enum(transactionMonthValues),
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
export type TransactionMonth = (typeof transactionMonthValues)[number];
