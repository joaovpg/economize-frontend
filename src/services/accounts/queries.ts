import { queryOptions } from "@tanstack/react-query";

import { getContas } from "./api";

export const accountsQueryKey = ["accounts"] as const;

export const accountsQueryOptions = () =>
  queryOptions({
    queryFn: ({ signal }) => getContas({ signal }),
    queryKey: accountsQueryKey,
    staleTime: 5 * 60 * 1000,
  });
