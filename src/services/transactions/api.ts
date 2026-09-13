import { api, parseApiResponse } from "../../lib/api";
import {
  consultaTransacoesResponseSchema,
  getTransacoesQuerySchema,
  type GetTransacoesOptions,
} from "./contracts";

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
