import { type ApiRequestOptions, api, parseApiResponse } from "../../lib/api";
import { contasResponseSchema } from "./contracts";

export async function getContas({ signal }: ApiRequestOptions = {}) {
  return parseApiResponse(api.get("contas", { signal }), contasResponseSchema);
}
