"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ActionResult } from "@/types";
import {
  precoTrechoFormSchema,
  type PrecoTrechoFormData,
} from "./schemas";

export async function createPrecoTrecho(
  data: PrecoTrechoFormData,
): Promise<ActionResult> {
  const parsed = precoTrechoFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("precos_trechos").insert({
    itinerario_id: parsed.data.itinerario_id,
    ponto_origem_id: parsed.data.ponto_origem_id,
    ponto_destino_id: parsed.data.ponto_destino_id,
    tipo_acomodacao_id: parsed.data.tipo_acomodacao_id,
    preco: parsed.data.preco,
    vigencia_inicio: parsed.data.vigencia_inicio,
    vigencia_fim: parsed.data.vigencia_fim || null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/precos-trechos");
  return { success: true };
}

export async function updatePrecoTrecho(
  id: string,
  data: PrecoTrechoFormData,
): Promise<ActionResult> {
  const parsed = precoTrechoFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("precos_trechos")
    .update({
      itinerario_id: parsed.data.itinerario_id,
      ponto_origem_id: parsed.data.ponto_origem_id,
      ponto_destino_id: parsed.data.ponto_destino_id,
      tipo_acomodacao_id: parsed.data.tipo_acomodacao_id,
      preco: parsed.data.preco,
      vigencia_inicio: parsed.data.vigencia_inicio,
      vigencia_fim: parsed.data.vigencia_fim || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/precos-trechos");
  return { success: true };
}

export async function deletePrecoTrecho(
  id: string,
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("precos_trechos")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/precos-trechos");
  return { success: true };
}
