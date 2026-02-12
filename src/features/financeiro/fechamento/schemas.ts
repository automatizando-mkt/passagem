import { z } from "zod";

export const fechamentoCaixaFormSchema = z.object({
  data_fechamento: z.string().min(1, "Selecione a data"),
  observacoes: z.string(),
});

export type FechamentoCaixaFormData = z.infer<typeof fechamentoCaixaFormSchema>;
