import { type ApiRequestOptions, api, parseApiResponse } from "../../lib/api";
import { createContractApiError } from "../../lib/api-errors";
import {
  cadastrarCategoriaRequestSchema,
  categoriaResponseSchema,
  categoriasResponseSchema,
  editarCategoriaRequestSchema,
  getCategoriasQuerySchema,
  type CadastrarCategoriaRequest,
  type CategoriaResponse,
  type EditarCategoriaRequest,
  type GetCategoriasOptions,
} from "./contracts";

import type { ResponsePromise } from "ky";

const DEFAULT_CATEGORY_COLOR = "#FFFFFF";

export async function getCategorias(options: GetCategoriasOptions = {}) {
  const query = getCategoriasQuerySchema.parse({ ativo: options.ativo });
  const searchParams = query.ativo === undefined ? undefined : { ativo: String(query.ativo) };

  return parseApiResponse(
    api.get("categorias", { searchParams, signal: options.signal }),
    categoriasResponseSchema,
  );
}

async function parseOptionalCategoriaResponse(
  response: ResponsePromise,
): Promise<CategoriaResponse | null> {
  const body = await response.text();

  if (body.trim().length === 0) {
    return null;
  }

  let parsedBody: unknown;

  try {
    parsedBody = JSON.parse(body);
  } catch (error) {
    throw createContractApiError(error);
  }

  if (parsedBody === null) {
    return null;
  }

  const result = categoriaResponseSchema.safeParse(parsedBody);

  if (!result.success) {
    throw createContractApiError(result.error);
  }

  return result.data;
}

export async function postCategoria(
  input: Omit<CadastrarCategoriaRequest, "cor">,
  options: ApiRequestOptions = {},
) {
  const request = cadastrarCategoriaRequestSchema.parse({
    ...input,
    cor: DEFAULT_CATEGORY_COLOR,
  });

  return parseOptionalCategoriaResponse(
    api.post("categorias", { json: request, signal: options.signal }),
  );
}

export async function putCategoria(
  categoriaId: string,
  input: Omit<EditarCategoriaRequest, "cor">,
  options: ApiRequestOptions = {},
) {
  const request = editarCategoriaRequestSchema.parse({
    ...input,
    cor: DEFAULT_CATEGORY_COLOR,
  });

  return parseOptionalCategoriaResponse(
    api.put(`categorias/${categoriaId}`, { json: request, signal: options.signal }),
  );
}
