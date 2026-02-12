import { z } from "zod";

export const acomodacaoItemSchema = z.object({
  tipo_acomodacao_id: z.string().min(1, "Selecione o tipo"),
  quantidade: z.number().int().min(1, "Quantidade minima: 1"),
  controle_assentos: z.boolean(),
});

export const embarcacaoFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  capacidade: z.number().int().positive("Capacidade deve ser positiva"),
  tipo: z.enum(["barco", "navio", "lancha", "balsa", "ferry"], {
    message: "Selecione o tipo",
  }),
  acomodacoes: z.array(acomodacaoItemSchema),
});
export type EmbarcacaoFormData = z.infer<typeof embarcacaoFormSchema>;

export const itinerarioFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string(),
  origem: z.string().min(2, "Informe a origem"),
  destino: z.string().min(2, "Informe o destino"),
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
