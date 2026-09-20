import { z } from "zod";

export const categoryFormSchema = z.object({
  categoriaPaiId: z.uuid().nullable(),
  nome: z.string().trim().min(1, "Informe o nome da categoria."),
});

export type CategoryFormData = z.infer<typeof categoryFormSchema>;
