import { z } from "zod";

import type { ApiRequestOptions } from "../../lib/api";

export const categoriaResponseSchema = z.looseObject({
  id: z.uuid(),
  nome: z.string(),
  cor: z.string().nullable(),
  categoriaPaiId: z.uuid().nullable(),
  ativo: z.boolean(),
});

export const categoriasResponseSchema = z.array(categoriaResponseSchema);
export const getCategoriasQuerySchema = z.object({ ativo: z.boolean().default(true) });

export type CategoriaResponse = z.infer<typeof categoriaResponseSchema>;
export type GetCategoriasOptions = ApiRequestOptions & { ativo?: boolean };
