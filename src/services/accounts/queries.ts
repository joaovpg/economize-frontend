import { queryOptions } from "@tanstack/react-query";

import { getContas } from "./api";

export const accountsQueryKey = ["accounts"] as const;

export const accountsQueryOptions = () =>
  queryOptions({
    queryKey: accountsQueryKey,
    queryFn: ({ signal }) => getContas({ signal }),
    staleTime: 5 * 60 * 1000,
  });
