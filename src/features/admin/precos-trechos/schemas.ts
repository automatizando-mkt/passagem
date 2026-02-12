import { z } from "zod";

export const precoTrechoFormSchema = z.object({
  itinerario_id: z.string().min(1, "Selecione o itinerario"),
  ponto_origem_id: z.string().min(1, "Selecione o ponto de origem"),
  ponto_destino_id: z.string().min(1, "Selecione o ponto de destino"),
  tipo_acomodacao_id: z.string().min(1, "Selecione o tipo de acomodacao"),
  preco: z.number().positive("Preco deve ser positivo"),
  vigencia_inicio: z.string().min(1, "Data de inicio obrigatoria"),
  vigencia_fim: z.string(),
});
export type PrecoTrechoFormData = z.infer<typeof precoTrechoFormSchema>;
