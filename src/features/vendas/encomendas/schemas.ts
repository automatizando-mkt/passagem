import { z } from "zod";

export const encomendaFormSchema = z.object({
  viagem_id: z.string().min(1, "Selecione a viagem"),
  remetente: z.string().min(2, "Nome do remetente obrigatorio"),
  destinatario: z.string().min(2, "Nome do destinatario obrigatorio"),
  descricao: z.string().min(2, "Descricao obrigatoria"),
  peso_kg: z.string(), // optional, will parse to number or null
  setor_id: z.string(), // optional
  valor: z.number({ message: "Informe o valor" }).min(0.01, "Valor deve ser maior que zero"),
  metodo_pagamento: z.enum(["pix", "cartao", "dinheiro"], {
    message: "Selecione o metodo de pagamento",
  }),
});
export type EncomendaFormData = z.infer<typeof encomendaFormSchema>;
