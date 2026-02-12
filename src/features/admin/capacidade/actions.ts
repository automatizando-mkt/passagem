"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ActionResult } from "@/types";
import { capacidadeFormSchema, type CapacidadeFormData } from "./schemas";

export async function upsertCapacidade(
  data: CapacidadeFormData,
): Promise<ActionResult> {
  const parsed = capacidadeFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();

  // Upsert: insere ou atualiza se ja existe (UNIQUE constraint)
  const { error } = await supabase.from("capacidade_acomodacao").upsert(
    {
      embarcacao_id: parsed.data.embarcacao_id,
      tipo_acomodacao_id: parsed.data.tipo_acomodacao_id,
      quantidade: parsed.data.quantidade,
    },
    { onConflict: "embarcacao_id,tipo_acomodacao_id" },
  );

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/embarcacoes/${parsed.data.embarcacao_id}`);
  return { success: true };
}

export async function deleteCapacidade(
  id: string,
  embarcacaoId: string,
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("capacidade_acomodacao")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/embarcacoes/${embarcacaoId}`);
  return { success: true };
}
