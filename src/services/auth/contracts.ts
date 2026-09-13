import { z } from "zod";

import { emailSchema, passwordSchema } from "../../lib/auth";

export const loginRequestSchema = z.object({
  email: emailSchema,
  senha: passwordSchema,
});

export const csrfTokenResponseSchema = z.object({
  csrfToken: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type CsrfTokenResponse = z.infer<typeof csrfTokenResponseSchema>;
