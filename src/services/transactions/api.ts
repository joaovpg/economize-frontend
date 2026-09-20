import { z } from "zod";

import { api, parseApiResponse, type ApiRequestOptions } from "../../lib/api";
import {
  consultaTransacoesResponseSchema,
  criarTransacaoRequestSchema,
  getTransacoesQuerySchema,
  transacaoResponseSchema,
  type CriarTransacaoRequest,
  type GetTransacoesOptions,
} from "./contracts";

export async function postTransacao(input: CriarTransacaoRequest, options: ApiRequestOptions = {}) {
  const request = criarTransacaoRequestSchema.parse(input);

  return parseApiResponse(
    api.post("transacoes", { json: request, signal: options.signal }),
    transacaoResponseSchema,
  );
}

export async function deleteTransacao(id: string, options: ApiRequestOptions = {}) {
  const transactionId = z.uuid().parse(id);

  await api.delete(`transacoes/${transactionId}`, { signal: options.signal });
}

export async function getTransacoes(options: GetTransacoesOptions) {
  const query = getTransacoesQuerySchema.parse({
    categoriaIds: options.categoriaIds,
    contaIds: options.contaIds,
    fim: options.fim,
    inicio: options.inicio,
  });
  const searchParams = new URLSearchParams({ fim: query.fim, inicio: query.inicio });

  for (const contaId of query.contaIds ?? []) {
    searchParams.append("contaId", contaId);
  }

  for (const categoriaId of query.categoriaIds ?? []) {
    searchParams.append("categoriaId", categoriaId);
  }

  return parseApiResponse(
    api.get("transacoes", { searchParams, signal: options.signal }),
    consultaTransacoesResponseSchema,
  );
}
