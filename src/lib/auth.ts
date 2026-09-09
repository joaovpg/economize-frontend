import { z } from "zod";

export const emailSchema = z
  .email("Digite um e-mail válido.")
  .min(1, "Digite seu e-mail.")
  .max(320, "Use até 320 caracteres.");

export const passwordSchema = z
  .string()
  .min(1, "Digite sua senha.")
  .refine((value) => value.trim().length > 0, "Digite sua senha.");
