import { z } from "zod";

import { api, parseApiResponse, type ApiRequestOptions } from "../../lib/api";
import { versaoEdicaoSchema } from "../transactions/shared";
import {
  alterarTransferenciaRequestSchema,
  criarTransferenciaRequestSchema,
  transferenciaResponseSchema,
  type AlterarTransferenciaRequest,
  type CriarTransferenciaRequest,
} from "./contracts";

export type DeleteTransferenciaOptions = ApiRequestOptions & {
  versaoEdicao: string;
};

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

export async function deleteTransferencia(id: string, options: DeleteTransferenciaOptions) {
  const transferId = z.uuid().parse(id);
  const versaoEdicao = versaoEdicaoSchema.parse(options.versaoEdicao);

  await api.delete(`transferencias/${transferId}`, {
    searchParams: new URLSearchParams({ versaoEdicao }),
    signal: options.signal,
  });
}
