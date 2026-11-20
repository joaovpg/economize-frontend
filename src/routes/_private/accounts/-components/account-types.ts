import type { ContaResponse } from "../../../../services/accounts/contracts";

export type PendingAccountToggle = {
  account: ContaResponse;
  nextActive: boolean;
};
