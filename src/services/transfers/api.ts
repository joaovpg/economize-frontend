import { z } from "zod";

import { api, parseApiResponse, type ApiRequestOptions } from "../../lib/api";
import {
  alterarTransferenciaRequestSchema,
  criarTransferenciaRequestSchema,
  transferenciaResponseSchema,
  type AlterarTransferenciaRequest,
  type CriarTransferenciaRequest,
} from "./contracts";

export async function postTransferencia(
  input: CriarTransferenciaRequest,
  options: ApiRequestOptions = {},
) {
  const request = criarTransferenciaRequestSchema.parse(input);

  return parseApiResponse(
    api.post("transferencias", { json: request, signal: options.signal }),
    transferenciaResponseSchema,
  );
}

export async function putTransferencia(
  id: string,
  input: AlterarTransferenciaRequest,
  options: ApiRequestOptions = {},
) {
  const transferId = z.uuid().parse(id);
  const request = alterarTransferenciaRequestSchema.parse(input);

  return parseApiResponse(
    api.put(`transferencias/${transferId}`, { json: request, signal: options.signal }),
    transferenciaResponseSchema,
  );
}

export async function deleteTransferencia(id: string, options: ApiRequestOptions = {}) {
  const transferId = z.uuid().parse(id);

  await api.delete(`transferencias/${transferId}`, { signal: options.signal });
}
