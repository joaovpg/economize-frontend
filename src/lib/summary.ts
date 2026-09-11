import { z } from "zod";

export const allAccountsFilterValue = "Todas as contas";
export const categoryFilterValueSchema = z.uuid();
export const accountFilterValueSchema = z.union([z.uuid(), z.literal(allAccountsFilterValue)]);

export type AccountFilterValue = z.infer<typeof accountFilterValueSchema>;

export const summaryMonthValues = ["2026-08", "2026-07"] as const;

export type SummaryFilterResource = {
  id: string;
  nome: string;
};

export type DemoCategoryResource = SummaryFilterResource & {
  categoriaPaiId: string | null;
};

export const demoAccountResources = [
  { id: "00000000-0000-4000-8000-000000000001", nome: "Nubank" },
  { id: "00000000-0000-4000-8000-000000000002", nome: "Banco Inter" },
  { id: "00000000-0000-4000-8000-000000000003", nome: "C6 Crédito" },
] as const satisfies readonly SummaryFilterResource[];

const demoCategoryIds = {
  aluguel: "00000000-0000-4000-8000-000000000102",
  lazer: "00000000-0000-4000-8000-000000000105",
  mercado: "00000000-0000-4000-8000-000000000103",
  moradia: "00000000-0000-4000-8000-000000000101",
  receita: "00000000-0000-4000-8000-000000000106",
  transporte: "00000000-0000-4000-8000-000000000104",
} as const;

export const demoCategoryResources = [
  { categoriaPaiId: null, id: demoCategoryIds.moradia, nome: "Moradia" },
  { categoriaPaiId: demoCategoryIds.moradia, id: demoCategoryIds.aluguel, nome: "Aluguel" },
  { categoriaPaiId: null, id: demoCategoryIds.mercado, nome: "Mercado" },
  { categoriaPaiId: null, id: demoCategoryIds.transporte, nome: "Transporte" },
  { categoriaPaiId: null, id: demoCategoryIds.lazer, nome: "Lazer" },
  { categoriaPaiId: null, id: demoCategoryIds.receita, nome: "Receita" },
] as const satisfies readonly DemoCategoryResource[];

export const monthOptions = [
  { label: "Agosto 2026", value: "2026-08" },
  { label: "Julho 2026", value: "2026-07" },
] as const;

export const summarySearchSchema = z.object({
  accounts: z
    .array(accountFilterValueSchema)
    .catch([allAccountsFilterValue])
    .default([allAccountsFilterValue]),
  categories: z.array(categoryFilterValueSchema).catch([]).default([]),
  includePreviousBalance: z.boolean().catch(true).default(true),
  ledgerExpanded: z.boolean().catch(true).default(true),
  month: z.enum(summaryMonthValues).catch("2026-08").default("2026-08"),
  q: z.string().catch("").default(""),
});

export type SummarySearch = z.infer<typeof summarySearchSchema>;
export type SummaryMonth = SummarySearch["month"];

export type Movement = {
  account: string;
  accountId: string;
  category: string;
  categoryId: string;
  description: string;
  filterCategory: string;
  id: string;
  kind: "income" | "expense";
  value: number;
};

export type CategoryExpense = {
  amount: number;
  name: string;
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
        accountId: demoAccountResources[0].id,
        categoryId: demoCategoryIds.aluguel,
        id: "rent-august",
        description: "Aluguel",
        category: "Aluguel",
        filterCategory: "Aluguel",
        account: "Nubank",
        kind: "expense",
        value: 1850,
      },
      {
        accountId: demoAccountResources[1].id,
        categoryId: demoCategoryIds.receita,
        id: "salary-august",
        description: "Salário",
        category: "Receita",
        filterCategory: "Receita",
        account: "Banco Inter",
        kind: "income",
        value: 7500,
      },
      {
        accountId: demoAccountResources[2].id,
        categoryId: demoCategoryIds.mercado,
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
        accountId: demoAccountResources[0].id,
        categoryId: demoCategoryIds.aluguel,
        id: "rent-july",
        description: "Aluguel",
        category: "Aluguel",
        filterCategory: "Aluguel",
        account: "Nubank",
        kind: "expense",
        value: 1850,
      },
      {
        accountId: demoAccountResources[1].id,
        categoryId: demoCategoryIds.receita,
        id: "salary-july",
        description: "Salário",
        category: "Receita",
        filterCategory: "Receita",
        account: "Banco Inter",
        kind: "income",
        value: 7200,
      },
      {
        accountId: demoAccountResources[2].id,
        categoryId: demoCategoryIds.mercado,
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
