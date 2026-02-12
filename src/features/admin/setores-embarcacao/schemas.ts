import { z } from "zod";

export const setorEmbarcacaoFormSchema = z.object({
  embarcacao_id: z.string().min(1, "Selecione a embarcacao"),
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string(),
});
export type SetorEmbarcacaoFormData = z.infer<typeof setorEmbarcacaoFormSchema>;
