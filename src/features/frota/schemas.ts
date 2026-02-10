import { z } from "zod";

export const embarcacaoFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  capacidade: z.number().int().positive("Capacidade deve ser positiva"),
  tipo: z.enum(["lancha", "balsa", "catamara", "ferry"], {
    message: "Selecione o tipo",
  }),
});
export type EmbarcacaoFormData = z.infer<typeof embarcacaoFormSchema>;

export const itinerarioFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string(),
});
export type ItinerarioFormData = z.infer<typeof itinerarioFormSchema>;

export const pontoParadaFormSchema = z.object({
  nome_local: z.string().min(2, "Nome do local obrigatorio"),
  duracao_parada_min: z
    .number()
    .int()
    .min(0, "Duracao nao pode ser negativa"),
});
export type PontoParadaFormData = z.infer<typeof pontoParadaFormSchema>;
