"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ActionResult, StatusViagem } from "@/types";
import { viagemFormSchema, type ViagemFormData } from "./schemas";

export async function createViagem(
  data: ViagemFormData,
): Promise<ActionResult> {
  const parsed = viagemFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("viagens")
    .insert({
      itinerario_id: parsed.data.itinerario_id,
      embarcacao_id: parsed.data.embarcacao_id,
      data_saida: parsed.data.data_saida,
      observacoes: parsed.data.observacoes || null,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/viagens");
  return { success: true };
}

export async function updateViagem(
  id: string,
  data: ViagemFormData,
): Promise<ActionResult> {
  const parsed = viagemFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("viagens")
    .update({
      itinerario_id: parsed.data.itinerario_id,
      embarcacao_id: parsed.data.embarcacao_id,
      data_saida: parsed.data.data_saida,
      observacoes: parsed.data.observacoes || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/viagens");
  return { success: true };
}

export async function updateViagemStatus(
  id: string,
  status: StatusViagem,
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("viagens")
    .update({ status })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/viagens");
  return { success: true };
}

export async function duplicateViagem(
  viagemId: string,
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  // Fetch the original trip
  const { data: original, error: fetchError } = await supabase
    .from("viagens")
    .select("itinerario_id, embarcacao_id, observacoes")
    .eq("id", viagemId)
    .single();

  if (fetchError || !original)
    return { success: false, error: "Viagem nao encontrada" };

  // Create new trip with same data but new date (tomorrow) and status=programada
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(8, 0, 0, 0);

  const { error } = await supabase.from("viagens").insert({
    itinerario_id: original.itinerario_id,
    embarcacao_id: original.embarcacao_id,
    data_saida: tomorrow.toISOString(),
    observacoes: original.observacoes,
    status: "programada",
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/viagens");
  return { success: true };
}
