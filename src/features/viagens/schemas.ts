import { z } from "zod";

export const viagemFormSchema = z.object({
  itinerario_id: z.string().min(1, "Selecione o itinerario"),
  embarcacao_id: z.string().min(1, "Selecione a embarcacao"),
  data_saida: z.string().min(1, "Informe a data de saida"),
  observacoes: z.string(),
});
export type ViagemFormData = z.infer<typeof viagemFormSchema>;
