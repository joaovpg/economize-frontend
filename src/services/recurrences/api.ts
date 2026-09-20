import { z } from "zod";

import { api, parseApiResponse, type ApiRequestOptions } from "../../lib/api";
import {
  alterarOcorrenciaRecorrenteRequestSchema,
  criarRecorrenciaRequestSchema,
  recurrenceScopeSchema,
  recorrenciaOperacaoResponseSchema,
  recorrenciaResponseSchema,
  type AlterarOcorrenciaRecorrenteRequest,
  type CriarRecorrenciaRequest,
  type DeleteRecorrenciaOptions,
} from "./contracts";

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
