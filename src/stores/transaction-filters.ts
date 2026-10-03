import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  allAccountsFilterValue,
  transactionFilterValuesSchema,
  type TransactionFilterValues,
} from "../lib/transaction-filters";

type TransactionFilterStore = TransactionFilterValues & {
  clearFilters: () => void;
  resetFilters: () => void;
  setSearch: (search: string) => void;
  setFilters: (filters: TransactionFilterValues) => void;
};

let searchTimeoutId: ReturnType<typeof setTimeout> | undefined;

function cancelScheduledSearch() {
  if (searchTimeoutId !== undefined) {
    clearTimeout(searchTimeoutId);
    searchTimeoutId = undefined;
  }
}

function getInitialFilters(): TransactionFilterValues {
  return {
    accounts: [allAccountsFilterValue],
    categories: [],
    includePreviousBalance: true,
    q: "",
  };
}

export const useTransactionFilterStore = create<TransactionFilterStore>()(
  persist(
    (set) => ({
      ...getInitialFilters(),
      clearFilters: () => {
        cancelScheduledSearch();
        set((state) => ({
          ...getInitialFilters(),
          includePreviousBalance: state.includePreviousBalance,
        }));
      },
      resetFilters: () => {
        cancelScheduledSearch();
        set(getInitialFilters());
      },
      setSearch: (search) => set({ q: search.trim() }),
      setFilters: (filters) => set(transactionFilterValuesSchema.parse(filters)),
    }),
    {
      merge: (persistedState, currentState) => {
        const parsedState = transactionFilterValuesSchema.safeParse(persistedState);

        return parsedState.success ? { ...currentState, ...parsedState.data } : currentState;
      },
      name: "economize-transaction-filters",
      partialize: ({ accounts, categories, includePreviousBalance, q }) => ({
        accounts,
        categories,
        includePreviousBalance,
        q,
      }),
      storage: createJSONStorage(() => localStorage),
      version: 1,
    },
  ),
);

export function scheduleTransactionSearch(search: string) {
  cancelScheduledSearch();
  searchTimeoutId = setTimeout(() => {
    useTransactionFilterStore.getState().setSearch(search);
    searchTimeoutId = undefined;
  }, 300);
}
