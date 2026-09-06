import { z } from "zod";

export const categoryOptions = ["Moradia", "Mercado", "Transporte", "Lazer"] as const;
export const accountOptions = ["Nubank", "Banco Inter", "C6 Crédito"] as const;
export const accountFilterOptions = ["Todas as contas", ...accountOptions] as const;
export const summaryMonthValues = ["2026-08", "2026-07"] as const;

export const monthOptions = [
  { label: "Agosto 2026", value: "2026-08" },
  { label: "Julho 2026", value: "2026-07" },
] as const;

export const summarySearchSchema = z.object({
  accounts: z
    .array(z.enum(accountFilterOptions))
    .catch(["Todas as contas"])
    .default(["Todas as contas"]),
  categories: z.array(z.enum(categoryOptions)).catch([]).default([]),
  includePreviousBalance: z.boolean().catch(true).default(true),
  ledgerExpanded: z.boolean().catch(true).default(true),
  month: z.enum(summaryMonthValues).catch("2026-08").default("2026-08"),
  q: z.string().catch("").default(""),
});

export type SummarySearch = z.infer<typeof summarySearchSchema>;
export type SummaryMonth = SummarySearch["month"];

export type Movement = {
  account: (typeof accountOptions)[number];
  category: string;
  description: string;
  filterCategory: string;
  id: string;
  kind: "income" | "expense";
  value: number;
};

export type CategoryExpense = {
  amount: number;
  name: (typeof categoryOptions)[number];
  share: number;
};

export type SummaryData = {
  categoryExpenses: CategoryExpense[];
  expenses: number;
  income: number;
  monthLabel: string;
  movements: Movement[];
  previousBalance: number;
};

export type TransactionData = Movement & {
  dateLabel: string;
};

const summaryByMonth: Record<SummaryMonth, SummaryData> = {
  "2026-08": {
    monthLabel: "Agosto 2026",
    previousBalance: 1240,
    income: 7850,
    expenses: 5420,
    categoryExpenses: [
      { name: "Moradia", amount: 1950, share: 88 },
      { name: "Mercado", amount: 1120, share: 62 },
      { name: "Transporte", amount: 720, share: 42 },
      { name: "Lazer", amount: 480, share: 35 },
    ],
    movements: [
      {
        id: "rent-august",
        description: "Aluguel",
        category: "Moradia",
        filterCategory: "Moradia",
        account: "Nubank",
        kind: "expense",
        value: 1850,
      },
      {
        id: "salary-august",
        description: "Salário",
        category: "Receita",
        filterCategory: "Receita",
        account: "Banco Inter",
        kind: "income",
        value: 7500,
      },
      {
        id: "market-august",
        description: "Mercado",
        category: "Alimentação",
        filterCategory: "Mercado",
        account: "C6 Crédito",
        kind: "expense",
        value: 312.4,
      },
    ],
  },
  "2026-07": {
    monthLabel: "Julho 2026",
    previousBalance: 980,
    income: 7200,
    expenses: 4890,
    categoryExpenses: [
      { name: "Moradia", amount: 1850, share: 86 },
      { name: "Mercado", amount: 980, share: 58 },
      { name: "Transporte", amount: 680, share: 40 },
      { name: "Lazer", amount: 390, share: 31 },
    ],
    movements: [
      {
        id: "rent-july",
        description: "Aluguel",
        category: "Moradia",
        filterCategory: "Moradia",
        account: "Nubank",
        kind: "expense",
        value: 1850,
      },
      {
        id: "salary-july",
        description: "Salário",
        category: "Receita",
        filterCategory: "Receita",
        account: "Banco Inter",
        kind: "income",
        value: 7200,
      },
      {
        id: "market-july",
        description: "Supermercado",
        category: "Alimentação",
        filterCategory: "Mercado",
        account: "C6 Crédito",
        kind: "expense",
        value: 286.7,
      },
    ],
  },
};

const transactionById: Record<string, TransactionData> = Object.values(summaryByMonth).reduce<
  Record<string, TransactionData>
>((transactions, summary) => {
  for (const movement of summary.movements) {
    transactions[movement.id] = {
      ...movement,
      dateLabel: summary.monthLabel,
    };
  }

  return transactions;
}, {});

export async function getSummaryData(month: SummaryMonth) {
  return summaryByMonth[month];
}

export async function getTransaction(transactionId: string) {
  return transactionById[transactionId];
}
