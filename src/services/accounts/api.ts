import { type ApiRequestOptions, api, parseApiResponse } from "../../lib/api";
import {
  cadastrarContaRequestSchema,
  contaResponseSchema,
  contasResponseSchema,
  editarContaRequestSchema,
  type CadastrarContaRequest,
  type EditarContaRequest,
} from "./contracts";

export async function getContas({ signal }: ApiRequestOptions = {}) {
  return parseApiResponse(api.get("contas", { signal }), contasResponseSchema);
}

export async function postConta(input: CadastrarContaRequest, options: ApiRequestOptions = {}) {
  const request = cadastrarContaRequestSchema.parse(input);

  return parseApiResponse(
    api.post("contas", { json: request, signal: options.signal }),
    contaResponseSchema,
  );
}

export async function putConta(
  contaId: string,
  input: EditarContaRequest,
  options: ApiRequestOptions = {},
) {
  const request = editarContaRequestSchema.parse(input);

  return parseApiResponse(
    api.put(`contas/${contaId}`, { json: request, signal: options.signal }),
    contaResponseSchema,
  );
}
