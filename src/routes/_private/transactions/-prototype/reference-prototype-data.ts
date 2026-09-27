import type { ContaResponse } from "../../../../services/accounts/contracts";
import type { CategoriaResponse } from "../../../../services/categories/contracts";
import type { ConsultaTransacoesResponse } from "../../../../services/transactions/contracts";

// THROWAWAY PROTOTYPE DATA: reproduz somente a referência visual fornecida pelo usuário. Remover
// este arquivo e todos os seus consumidores antes de promover uma variante para produção.

const accountIds = {
  main: "00000000-0000-0000-0000-000000000001",
  wallet: "00000000-0000-0000-0000-000000000002",
  nubankAccount: "00000000-0000-0000-0000-000000000003",
  nubankCard: "00000000-0000-0000-0000-000000000004",
  reserve: "00000000-0000-0000-0000-000000000005",
} as const;

const categoryIds = {
  expenses: "00000000-0000-0000-0000-000000000011",
  income: "00000000-0000-0000-0000-000000000012",
  housing: "00000000-0000-0000-0000-000000000013",
  food: "00000000-0000-0000-0000-000000000014",
  health: "00000000-0000-0000-0000-000000000015",
  subscriptions: "00000000-0000-0000-0000-000000000016",
  salary: "00000000-0000-0000-0000-000000000017",
  freelance: "00000000-0000-0000-0000-000000000018",
} as const;

export const prototypeAccounts = [
  {
    ativo: true,
    dataSaldoInicial: "2026-01-01",
    id: accountIds.main,
    moeda: "BRL",
    nome: "Conta principal",
    saldoInicial: 0,
  },
  {
    ativo: true,
    dataSaldoInicial: "2026-01-01",
    id: accountIds.wallet,
    moeda: "BRL",
    nome: "Carteira",
    saldoInicial: 0,
  },
  {
    ativo: true,
    dataSaldoInicial: "2026-01-01",
    id: accountIds.nubankAccount,
    moeda: "BRL",
    nome: "Nubank - Conta",
    saldoInicial: 0,
  },
  {
    ativo: true,
    dataSaldoInicial: "2026-01-01",
    id: accountIds.nubankCard,
    moeda: "BRL",
    nome: "Nubank - Cartão",
    saldoInicial: 0,
  },
  {
    ativo: true,
    dataSaldoInicial: "2026-01-01",
    id: accountIds.reserve,
    moeda: "BRL",
    nome: "Reserva",
    saldoInicial: 0,
  },
] satisfies readonly ContaResponse[];

export const prototypeCategories = [
  {
    ativo: true,
    categoriaPaiId: null,
    id: categoryIds.expenses,
    nome: "Despesas",
  },
  {
    ativo: true,
    categoriaPaiId: null,
    id: categoryIds.income,
    nome: "Receitas",
  },
  {
    ativo: true,
    categoriaPaiId: categoryIds.expenses,
    id: categoryIds.housing,
    nome: "Moradia",
  },
  {
    ativo: true,
    categoriaPaiId: categoryIds.expenses,
    id: categoryIds.food,
    nome: "Alimentação",
  },
  {
    ativo: true,
    categoriaPaiId: categoryIds.expenses,
    id: categoryIds.health,
    nome: "Saúde e bem-estar",
  },
  {
    ativo: true,
    categoriaPaiId: categoryIds.expenses,
    id: categoryIds.subscriptions,
    nome: "Assinaturas",
  },
  {
    ativo: true,
    categoriaPaiId: categoryIds.income,
    id: categoryIds.salary,
    nome: "Renda",
  },
  {
    ativo: true,
    categoriaPaiId: categoryIds.income,
    id: categoryIds.freelance,
    nome: "Renda extra",
  },
] satisfies readonly CategoriaResponse[];

export const prototypeTransactions = {
  fim: "2026-09",
  inicio: "2026-09",
  itens: [
    {
      categoriaId: categoryIds.health,
      contaId: accountIds.nubankCard,
      dataFinanceira: "2026-09-09",
      descricao: "Academia Viva",
      origem: "TRANSACAO_SIMPLES",
      valor: -129.9,
    },
    {
      categoriaId: categoryIds.health,
      contaId: accountIds.nubankAccount,
      dataFinanceira: "2026-09-09",
      descricao: "Farmácia São Bento",
      origem: "TRANSACAO_SIMPLES",
      valor: -86.5,
    },
    {
      categoriaId: categoryIds.salary,
      contaId: accountIds.main,
      dataFinanceira: "2026-09-16",
      descricao: "Salário",
      origem: "TRANSACAO_SIMPLES",
      valor: 8500,
    },
    {
      categoriaId: categoryIds.housing,
      contaId: accountIds.main,
      dataFinanceira: "2026-09-16",
      descricao: "Aluguel",
      origem: "TRANSACAO_SIMPLES",
      valor: -2250,
    },
    {
      categoriaId: categoryIds.food,
      contaId: accountIds.nubankCard,
      dataFinanceira: "2026-09-16",
      descricao: "Mercado Pão de Açúcar",
      origem: "TRANSACAO_SIMPLES",
      valor: -387.45,
    },
    {
      categoriaId: categoryIds.freelance,
      contaId: accountIds.main,
      dataFinanceira: "2026-09-23",
      descricao: "Projeto freelance",
      origem: "TRANSACAO_SIMPLES",
      valor: 1200,
    },
    {
      categoriaId: categoryIds.subscriptions,
      contaId: accountIds.nubankCard,
      dataFinanceira: "2026-09-23",
      descricao: "Spotify Premium",
      origem: "TRANSACAO_RECORRENTE",
      valor: -2.9,
    },
  ],
  saldoAbertura: 2140,
} satisfies ConsultaTransacoesResponse;
