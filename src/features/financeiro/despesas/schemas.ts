import { z } from "zod";

export const despesaViagemFormSchema = z.object({
  viagem_id: z.string().min(1, "Selecione a viagem"),
  descricao: z.string().min(2, "Descricao obrigatoria"),
  valor: z.number({ message: "Informe o valor" }).min(0.01, "Valor deve ser maior que zero"),
  categoria: z.enum(["combustivel", "manutencao", "alimentacao", "outros"], {
    message: "Selecione a categoria",
  }),
});

export type DespesaViagemFormData = z.infer<typeof despesaViagemFormSchema>;
