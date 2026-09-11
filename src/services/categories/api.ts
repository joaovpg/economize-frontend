import { api, parseApiResponse } from "../../lib/api";
import {
  categoriasResponseSchema,
  getCategoriasQuerySchema,
  type GetCategoriasOptions,
} from "./contracts";

export async function getCategorias(options: GetCategoriasOptions = {}) {
  const query = getCategoriasQuerySchema.parse({ ativo: options.ativo });

  return parseApiResponse(
    api.get("categorias", { searchParams: query, signal: options.signal }),
    categoriasResponseSchema,
  );
}
