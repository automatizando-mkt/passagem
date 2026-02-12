"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ActionResult } from "@/types";
import {
  setorEmbarcacaoFormSchema,
  type SetorEmbarcacaoFormData,
} from "./schemas";

export async function createSetorEmbarcacao(
  data: SetorEmbarcacaoFormData,
): Promise<ActionResult> {
  const parsed = setorEmbarcacaoFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("setores_embarcacao").insert({
    embarcacao_id: parsed.data.embarcacao_id,
    nome: parsed.data.nome,
    descricao: parsed.data.descricao || null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/setores-embarcacao");
  return { success: true };
}

export async function updateSetorEmbarcacao(
  id: string,
  data: SetorEmbarcacaoFormData,
): Promise<ActionResult> {
  const parsed = setorEmbarcacaoFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("setores_embarcacao")
    .update({
      nome: parsed.data.nome,
      descricao: parsed.data.descricao || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/setores-embarcacao");
  return { success: true };
}

export async function deleteSetorEmbarcacao(
  id: string,
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("setores_embarcacao")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/setores-embarcacao");
  return { success: true };
}
