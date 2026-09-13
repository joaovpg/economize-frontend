import { type ApiRequestOptions, api, parseApiResponse } from "../../lib/api";
import {
  cadastrarCategoriaRequestSchema,
  categoriaResponseSchema,
  categoriasResponseSchema,
  editarCategoriaRequestSchema,
  getCategoriasQuerySchema,
  type CadastrarCategoriaRequest,
  type EditarCategoriaRequest,
  type GetCategoriasOptions,
} from "./contracts";

const DEFAULT_CATEGORY_COLOR = "#FFFFFF";

export async function getCategorias(options: GetCategoriasOptions = {}) {
  const query = getCategoriasQuerySchema.parse({ ativo: options.ativo });
  const searchParams = query.ativo === undefined ? undefined : { ativo: String(query.ativo) };

  return parseApiResponse(
    api.get("categorias", { searchParams, signal: options.signal }),
    categoriasResponseSchema,
  );
}

export async function postCategoria(
  input: Omit<CadastrarCategoriaRequest, "cor">,
  options: ApiRequestOptions = {},
) {
  const request = cadastrarCategoriaRequestSchema.parse({
    ...input,
    cor: DEFAULT_CATEGORY_COLOR,
  });

  return parseApiResponse(
    api.post("categorias", { json: request, signal: options.signal }),
    categoriaResponseSchema,
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

  return parseApiResponse(
    api.put(`categorias/${categoriaId}`, { json: request, signal: options.signal }),
    categoriaResponseSchema,
  );
}
