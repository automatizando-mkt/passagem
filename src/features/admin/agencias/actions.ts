"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ActionResult } from "@/types";
import { agenciaFormSchema, type AgenciaFormData } from "./schemas";

export async function createAgencia(
  data: AgenciaFormData,
): Promise<ActionResult> {
  const parsed = agenciaFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("agencias").insert({
    nome: parsed.data.nome,
    cnpj_cpf: parsed.data.cnpj_cpf || null,
    percentual_comissao: parsed.data.percentual_comissao,
    contato: parsed.data.contato || null,
    endereco: parsed.data.endereco || null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/agencias");
  return { success: true };
}

export async function updateAgencia(
  id: string,
  data: AgenciaFormData,
): Promise<ActionResult> {
  const parsed = agenciaFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("agencias")
    .update({
      nome: parsed.data.nome,
      cnpj_cpf: parsed.data.cnpj_cpf || null,
      percentual_comissao: parsed.data.percentual_comissao,
      contato: parsed.data.contato || null,
      endereco: parsed.data.endereco || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/agencias");
  return { success: true };
}

export async function toggleAgencia(
  id: string,
  ativa: boolean,
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("agencias")
    .update({ ativa })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/agencias");
  return { success: true };
}
