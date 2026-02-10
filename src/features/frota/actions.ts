"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ActionResult } from "@/types";
import {
  embarcacaoFormSchema,
  itinerarioFormSchema,
  pontoParadaFormSchema,
  type EmbarcacaoFormData,
  type ItinerarioFormData,
  type PontoParadaFormData,
} from "./schemas";

// ========================
// Embarcacoes
// ========================

export async function createEmbarcacao(
  data: EmbarcacaoFormData,
): Promise<ActionResult> {
  const parsed = embarcacaoFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("embarcacoes").insert({
    nome: parsed.data.nome,
    capacidade: parsed.data.capacidade,
    tipo: parsed.data.tipo,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/embarcacoes");
  return { success: true };
}

export async function updateEmbarcacao(
  id: string,
  data: EmbarcacaoFormData,
): Promise<ActionResult> {
  const parsed = embarcacaoFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("embarcacoes")
    .update({
      nome: parsed.data.nome,
      capacidade: parsed.data.capacidade,
      tipo: parsed.data.tipo,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/embarcacoes");
  return { success: true };
}

export async function toggleEmbarcacao(
  id: string,
  ativa: boolean,
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("embarcacoes")
    .update({ ativa })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/embarcacoes");
  return { success: true };
}

// ========================
// Itinerarios
// ========================

export async function createItinerario(
  data: ItinerarioFormData,
): Promise<ActionResult> {
  const parsed = itinerarioFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.from("itinerarios").insert({
    nome: parsed.data.nome,
    descricao: parsed.data.descricao || null,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/itinerarios");
  return { success: true };
}

export async function updateItinerario(
  id: string,
  data: ItinerarioFormData,
): Promise<ActionResult> {
  const parsed = itinerarioFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("itinerarios")
    .update({
      nome: parsed.data.nome,
      descricao: parsed.data.descricao || null,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/itinerarios");
  return { success: true };
}

export async function toggleItinerario(
  id: string,
  ativo: boolean,
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("itinerarios")
    .update({ ativo })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/admin/itinerarios");
  return { success: true };
}

// ========================
// Pontos de Parada
// ========================

export async function createPontoParada(
  itinerarioId: string,
  data: PontoParadaFormData,
): Promise<ActionResult> {
  const parsed = pontoParadaFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();

  // Calcular proxima ordem
  const { data: existing } = await supabase
    .from("pontos_parada")
    .select("ordem")
    .eq("itinerario_id", itinerarioId)
    .order("ordem", { ascending: false })
    .limit(1);

  const nextOrdem = existing && existing.length > 0 ? existing[0].ordem + 1 : 1;

  const { error } = await supabase.from("pontos_parada").insert({
    itinerario_id: itinerarioId,
    nome_local: parsed.data.nome_local,
    ordem: nextOrdem,
    duracao_parada_min: parsed.data.duracao_parada_min,
  });

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/itinerarios/${itinerarioId}`);
  return { success: true };
}

export async function updatePontoParada(
  id: string,
  itinerarioId: string,
  data: PontoParadaFormData,
): Promise<ActionResult> {
  const parsed = pontoParadaFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("pontos_parada")
    .update({
      nome_local: parsed.data.nome_local,
      duracao_parada_min: parsed.data.duracao_parada_min,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/itinerarios/${itinerarioId}`);
  return { success: true };
}

export async function deletePontoParada(
  id: string,
  itinerarioId: string,
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("pontos_parada")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath(`/admin/itinerarios/${itinerarioId}`);
  return { success: true };
}

export async function reorderPontoParada(
  itinerarioId: string,
  pontoId: string,
  direction: "up" | "down",
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  const { data: pontos } = await supabase
    .from("pontos_parada")
    .select("id, ordem")
    .eq("itinerario_id", itinerarioId)
    .order("ordem");

  if (!pontos || pontos.length === 0)
    return { success: false, error: "Nenhum ponto encontrado" };

  const idx = pontos.findIndex((p) => p.id === pontoId);
  if (idx === -1)
    return { success: false, error: "Ponto nao encontrado" };

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= pontos.length)
    return { success: false, error: "Nao e possivel mover nessa direcao" };

  const pontoA = pontos[idx];
  const pontoB = pontos[swapIdx];

  // Swap usando valor temporario para evitar violacao UNIQUE(itinerario_id, ordem)
  const { error: e1 } = await supabase
    .from("pontos_parada")
    .update({ ordem: -1 })
    .eq("id", pontoA.id);
  if (e1) return { success: false, error: e1.message };

  const { error: e2 } = await supabase
    .from("pontos_parada")
    .update({ ordem: pontoA.ordem })
    .eq("id", pontoB.id);
  if (e2) return { success: false, error: e2.message };

  const { error: e3 } = await supabase
    .from("pontos_parada")
    .update({ ordem: pontoB.ordem })
    .eq("id", pontoA.id);
  if (e3) return { success: false, error: e3.message };

  revalidatePath(`/admin/itinerarios/${itinerarioId}`);
  return { success: true };
}
