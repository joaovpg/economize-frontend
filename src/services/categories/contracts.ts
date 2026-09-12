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

const categoriaNomeSchema = z.string().regex(/\S/);
const categoriaCorSchema = z.string().regex(/^\s*(#[0-9A-Fa-f]{6})?\s*$/);
const categoriaPaiIdSchema = z.uuid().nullable().optional();

export const cadastrarCategoriaRequestSchema = z.object({
  nome: categoriaNomeSchema,
  cor: categoriaCorSchema,
  categoriaPaiId: categoriaPaiIdSchema,
});

export const editarCategoriaRequestSchema = z.object({
  nome: categoriaNomeSchema,
  cor: categoriaCorSchema,
  categoriaPaiId: categoriaPaiIdSchema,
  ativo: z.boolean(),
});

export const getCategoriasQuerySchema = z.object({ ativo: z.boolean().optional() });

export type CategoriaResponse = z.infer<typeof categoriaResponseSchema>;
export type CadastrarCategoriaRequest = z.infer<typeof cadastrarCategoriaRequestSchema>;
export type EditarCategoriaRequest = z.infer<typeof editarCategoriaRequestSchema>;
export type GetCategoriasOptions = ApiRequestOptions & { ativo?: boolean };
