"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ActionResult } from "@/types";
import {
  tipoAcomodacaoFormSchema,
  type TipoAcomodacaoFormData,
} from "./schemas";

export async function createTipoAcomodacao(
  data: TipoAcomodacaoFormData,
): Promise<ActionResult> {
  const parsed = tipoAcomodacaoFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("tipos_acomodacao").insert({
    nome: parsed.data.nome,
    descricao: parsed.data.descricao || null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/tipos-acomodacao");
  return { success: true };
}

export async function updateTipoAcomodacao(
  id: string,
  data: TipoAcomodacaoFormData,
): Promise<ActionResult> {
  const parsed = tipoAcomodacaoFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("tipos_acomodacao")
    .update({
      nome: parsed.data.nome,
      descricao: parsed.data.descricao || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/tipos-acomodacao");
  return { success: true };
}

export async function deleteTipoAcomodacao(
  id: string,
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("tipos_acomodacao")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/tipos-acomodacao");
  return { success: true };
}
