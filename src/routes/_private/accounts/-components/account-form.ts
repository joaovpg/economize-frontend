import { z } from "zod";

export const accountFormSchema = z.object({
  dataSaldoInicial: z.iso.date("Informe a data do saldo inicial."),
  moeda: z
    .string()
    .trim()
    .length(3, "Informe uma moeda com 3 caracteres.")
    .transform((value) => value.toUpperCase()),
  nome: z.string().trim().min(1, "Informe o nome da conta.").max(120, "Use até 120 caracteres."),
  saldoInicial: z.number({ error: "Informe o saldo inicial." }),
});

export type AccountFormData = z.infer<typeof accountFormSchema>;
