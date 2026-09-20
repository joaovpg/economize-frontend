import { queryOptions } from "@tanstack/react-query";

import { getCategorias } from "./api";

export const categoriesQueryKey = ["categories"] as const;

type CategoriesQueryInput = {
  ativo?: boolean;
};

export const categoriesQueryOptions = ({ ativo }: CategoriesQueryInput = {}) =>
  queryOptions({
    queryFn: ({ signal }) => getCategorias({ ativo, signal }),
    queryKey: [...categoriesQueryKey, "list", { ativo: ativo ?? null }] as const,
    staleTime: 5 * 60 * 1000,
  });
