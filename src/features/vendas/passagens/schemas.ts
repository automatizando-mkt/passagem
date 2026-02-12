import { z } from "zod";

export const passagemFormSchema = z.object({
  viagem_id: z.string().min(1, "Selecione a viagem"),
  nome_passageiro: z.string().min(2, "Nome do passageiro obrigatorio"),
  documento: z.string().min(3, "Documento obrigatorio"),
  data_nascimento: z.string(),
  tipo_acomodacao_id: z.string().min(1, "Selecione a acomodacao"),
  ponto_embarque_id: z.string().min(1, "Selecione o embarque"),
  ponto_desembarque_id: z.string().min(1, "Selecione o desembarque"),
  assento: z.string(),
  metodo_pagamento: z.enum(["pix", "cartao", "dinheiro"], {
    message: "Selecione o metodo de pagamento",
  }),
});
export type PassagemFormData = z.infer<typeof passagemFormSchema>;
