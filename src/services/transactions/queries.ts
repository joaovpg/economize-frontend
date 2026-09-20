import { queryOptions } from "@tanstack/react-query";

import { getTransacoes } from "./api";

import type { GetTransacoesOptions } from "./contracts";

export const transactionsQueryKey = ["transactions"] as const;

type TransactionsQueryInput = Pick<
  GetTransacoesOptions,
  "categoriaIds" | "contaIds" | "fim" | "inicio"
>;

function normalizeTransactionsQuery(input: TransactionsQueryInput): TransactionsQueryInput {
  return {
    categoriaIds: [...(input.categoriaIds ?? [])].toSorted(),
    contaIds: [...(input.contaIds ?? [])].toSorted(),
    fim: input.fim,
    inicio: input.inicio,
  };
}

export const transactionsQueryOptions = (input: TransactionsQueryInput) => {
  const query = normalizeTransactionsQuery(input);

  return queryOptions({
    queryFn: ({ signal }) => getTransacoes({ ...query, signal }),
    queryKey: [...transactionsQueryKey, "list", query] as const,
    staleTime: 30_000,
  });
};
