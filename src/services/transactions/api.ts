import { api, parseApiResponse, type ApiRequestOptions } from "../../lib/api";
import {
  consultaTransacoesResponseSchema,
  criarRecorrenciaRequestSchema,
  criarTransacaoRequestSchema,
  criarTransferenciaRequestSchema,
  getTransacoesQuerySchema,
  recorrenciaResponseSchema,
  transacaoResponseSchema,
  transferenciaResponseSchema,
  type CriarRecorrenciaRequest,
  type CriarTransacaoRequest,
  type CriarTransferenciaRequest,
  type GetTransacoesOptions,
} from "./contracts";

export async function postTransacao(input: CriarTransacaoRequest, options: ApiRequestOptions = {}) {
  const request = criarTransacaoRequestSchema.parse(input);

  return parseApiResponse(
    api.post("transacoes", { json: request, signal: options.signal }),
    transacaoResponseSchema,
  );
}

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

export async function postRecorrencia(
  input: CriarRecorrenciaRequest,
  options: ApiRequestOptions = {},
) {
  const request = criarRecorrenciaRequestSchema.parse(input);

  return parseApiResponse(
    api.post("recorrencias", { json: request, signal: options.signal }),
    recorrenciaResponseSchema,
  );
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
