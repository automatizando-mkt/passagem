import { z } from "zod";

export const tipoAcomodacaoFormSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string(),
});
export type TipoAcomodacaoFormData = z.infer<typeof tipoAcomodacaoFormSchema>;
