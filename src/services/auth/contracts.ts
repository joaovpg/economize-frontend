import { z } from "zod";

import { emailSchema, passwordSchema } from "../../lib/auth";

export const loginRequestSchema = z.object({
  email: emailSchema,
  senha: passwordSchema,
});

export const cadastroRequestSchema = z.object({
  email: emailSchema,
  nome: z.string().trim().min(1, "Digite seu nome.").max(120, "Use até 120 caracteres."),
  senha: passwordSchema
    .min(8, "A senha deve ter entre 8 e 128 caracteres.")
    .max(128, "A senha deve ter entre 8 e 128 caracteres."),
  timezone: z.string().trim().min(1).max(80),
});

export const csrfTokenResponseSchema = z.object({
  csrfToken: z.string().min(1),
});

export const usuarioResponseSchema = z.looseObject({
  email: z.string(),
  id: z.uuid(),
  nome: z.string(),
  timezone: z.string(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type CadastroRequest = z.infer<typeof cadastroRequestSchema>;
export type CsrfTokenResponse = z.infer<typeof csrfTokenResponseSchema>;
export type UsuarioResponse = z.infer<typeof usuarioResponseSchema>;
