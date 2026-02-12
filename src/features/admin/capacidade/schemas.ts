import { z } from "zod";

export const capacidadeFormSchema = z.object({
  embarcacao_id: z.string().min(1, "Selecione a embarcacao"),
  tipo_acomodacao_id: z.string().min(1, "Selecione o tipo de acomodacao"),
  quantidade: z.number().int().min(0, "Quantidade nao pode ser negativa"),
});
export type CapacidadeFormData = z.infer<typeof capacidadeFormSchema>;
