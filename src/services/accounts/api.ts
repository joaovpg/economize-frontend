import { type ApiRequestOptions, api, parseApiResponse } from "../../lib/api";
import {
  cadastrarContaRequestSchema,
  contaResponseSchema,
  contasResponseSchema,
  type CadastrarContaRequest,
} from "./contracts";

export async function getContas({ signal }: ApiRequestOptions = {}) {
  return parseApiResponse(api.get("contas", { signal }), contasResponseSchema);
}

export async function postConta(
  input: CadastrarContaRequest,
  options: ApiRequestOptions = {},
) {
  const request = cadastrarContaRequestSchema.parse(input);

  return parseApiResponse(
    api.post("contas", { json: request, signal: options.signal }),
    contaResponseSchema,
  );
}
