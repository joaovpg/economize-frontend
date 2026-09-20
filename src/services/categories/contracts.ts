import { z } from "zod";

import type { ApiRequestOptions } from "../../lib/api";

export const categoriaResponseSchema = z.looseObject({
  ativo: z.boolean(),
  categoriaPaiId: z.uuid().nullable().optional(),
  cor: z.string().nullable().optional(),
  id: z.uuid(),
  nome: z.string(),
});

export const categoriasResponseSchema = z.array(categoriaResponseSchema);

const categoriaNomeSchema = z.string().regex(/\S/);
const categoriaCorSchema = z
  .string()
  .regex(/^\s*(#[0-9A-Fa-f]{6})?\s*$/)
  .nullable()
  .optional();
const categoriaPaiIdSchema = z.uuid().nullable().optional();

export const cadastrarCategoriaRequestSchema = z.object({
  categoriaPaiId: categoriaPaiIdSchema,
  cor: categoriaCorSchema,
  nome: categoriaNomeSchema,
});

export const editarCategoriaRequestSchema = z.object({
  ativo: z.boolean(),
  categoriaPaiId: categoriaPaiIdSchema,
  cor: categoriaCorSchema,
  nome: categoriaNomeSchema,
});

export const getCategoriasQuerySchema = z.object({ ativo: z.boolean().optional() });

export type CategoriaResponse = z.infer<typeof categoriaResponseSchema>;
export type CadastrarCategoriaRequest = z.infer<typeof cadastrarCategoriaRequestSchema>;
export type EditarCategoriaRequest = z.infer<typeof editarCategoriaRequestSchema>;
export type GetCategoriasOptions = ApiRequestOptions & { ativo?: boolean };
