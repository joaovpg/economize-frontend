import { api, parseApiResponse, type ApiRequestOptions } from "../../lib/api";
import {
  alterarTransacaoRequestSchema,
  consultaTransacoesResponseSchema,
  criarTransacaoRequestSchema,
  escopoEdicaoTransacaoSchema,
  getTransacoesQuerySchema,
  consultaTransacaoItemSchema,
  type AlterarTransacaoRequest,
  type CriarTransacaoRequest,
  type DeleteTransacaoOptions,
  type GetTransacoesOptions,
} from "./contracts";
import { chaveEdicaoSchema, versaoEdicaoSchema } from "./shared";

export async function postTransacao(input: CriarTransacaoRequest, options: ApiRequestOptions = {}) {
  const request = criarTransacaoRequestSchema.parse(input);

  return parseApiResponse(
    api.post("transacoes", { json: request, signal: options.signal }),
    consultaTransacaoItemSchema,
  );
}

export async function putTransacao(
  chaveEdicao: string,
  input: AlterarTransacaoRequest,
  options: ApiRequestOptions = {},
) {
  const editKey = chaveEdicaoSchema.parse(chaveEdicao);
  const request = alterarTransacaoRequestSchema.parse(input);

  return parseApiResponse(
    api.put(`transacoes/${encodeURIComponent(editKey)}`, {
      json: request,
      signal: options.signal,
    }),
    consultaTransacaoItemSchema,
  );
}

export async function deleteTransacao(chaveEdicao: string, options: DeleteTransacaoOptions) {
  const editKey = chaveEdicaoSchema.parse(chaveEdicao);
  const versaoEdicao = versaoEdicaoSchema.parse(options.versaoEdicao);
  const escopo = escopoEdicaoTransacaoSchema.optional().parse(options.escopo);
  const searchParams = new URLSearchParams({ versaoEdicao });

  if (escopo) {
    searchParams.set("escopo", escopo);
  }

  await api.delete(`transacoes/${encodeURIComponent(editKey)}`, {
    searchParams,
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
