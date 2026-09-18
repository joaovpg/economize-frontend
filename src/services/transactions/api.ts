import { z } from "zod";

import { api, parseApiResponse, type ApiRequestOptions } from "../../lib/api";
import {
  alterarOcorrenciaRecorrenteRequestSchema,
  alterarTransferenciaRequestSchema,
  consultaTransacoesResponseSchema,
  criarRecorrenciaRequestSchema,
  criarTransacaoRequestSchema,
  criarTransferenciaRequestSchema,
  getTransacoesQuerySchema,
  recurrenceScopeSchema,
  recorrenciaOperacaoResponseSchema,
  recorrenciaResponseSchema,
  transacaoResponseSchema,
  transferenciaResponseSchema,
  type AlterarOcorrenciaRecorrenteRequest,
  type AlterarTransferenciaRequest,
  type CriarRecorrenciaRequest,
  type CriarTransacaoRequest,
  type CriarTransferenciaRequest,
  type DeleteRecorrenciaOptions,
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

export async function putOcorrenciaRecorrente(
  segmentoId: string,
  dataOriginal: string,
  input: AlterarOcorrenciaRecorrenteRequest,
  options: ApiRequestOptions = {},
) {
  const recurrenceSegmentId = z.uuid().parse(segmentoId);
  const originalDate = z.iso.date().parse(dataOriginal);
  const request = alterarOcorrenciaRecorrenteRequestSchema.parse(input);

  return parseApiResponse(
    api.put(`recorrencias/${recurrenceSegmentId}/ocorrencias/${originalDate}`, {
      json: request,
      signal: options.signal,
    }),
    recorrenciaOperacaoResponseSchema,
  );
}

export async function deleteOcorrenciaRecorrente(
  segmentoId: string,
  dataOriginal: string,
  options: DeleteRecorrenciaOptions = {},
) {
  const recurrenceSegmentId = z.uuid().parse(segmentoId);
  const originalDate = z.iso.date().parse(dataOriginal);
  const scope = recurrenceScopeSchema.parse(options.escopo ?? "ONLY_THIS");

  await api.delete(`recorrencias/${recurrenceSegmentId}/ocorrencias/${originalDate}`, {
    searchParams: { escopo: scope },
    signal: options.signal,
  });
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
