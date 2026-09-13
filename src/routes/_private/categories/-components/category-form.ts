import { z } from "zod";

export const categoryFormSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome da categoria."),
  categoriaPaiId: z.uuid().nullable(),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
