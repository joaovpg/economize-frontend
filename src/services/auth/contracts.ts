import { z } from "zod";

import { emailSchema, passwordSchema } from "../../lib/auth";

export const loginRequestSchema = z.object({
  email: emailSchema,
  senha: passwordSchema,
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;
