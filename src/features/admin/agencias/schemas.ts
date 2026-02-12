import { z } from "zod";

export const agenciaFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cnpj_cpf: z.string(),
  percentual_comissao: z.number().min(0, "Minimo 0%").max(100, "Maximo 100%"),
  contato: z.string(),
  endereco: z.string(),
});
export type AgenciaFormData = z.infer<typeof agenciaFormSchema>;
