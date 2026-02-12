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

  // Calcular capacidade total a partir das acomodacoes
  const capacidadeTotal =
    parsed.data.acomodacoes.length > 0
      ? parsed.data.acomodacoes.reduce((sum, a) => sum + a.quantidade, 0)
      : parsed.data.capacidade;

  // 1. Criar embarcacao
  const { data: embarcacao, error } = await supabase
    .from("embarcacoes")
    .insert({
      nome: parsed.data.nome,
      capacidade: capacidadeTotal,
      tipo: parsed.data.tipo,
      controle_assentos: parsed.data.controle_assentos,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  // 2. Inserir capacidade_acomodacao para cada acomodacao
  if (parsed.data.acomodacoes.length > 0) {
    const capacidadeRows = parsed.data.acomodacoes.map((a) => ({
      embarcacao_id: embarcacao.id,
      tipo_acomodacao_id: a.tipo_acomodacao_id,
      quantidade: a.quantidade,
    }));

    const { error: capError } = await supabase
      .from("capacidade_acomodacao")
      .insert(capacidadeRows);

    if (capError) return { success: false, error: capError.message };

    // 3. Se controle_assentos ativo, gerar assentos numerados
    if (parsed.data.controle_assentos) {
      const assentoRows: {
        embarcacao_id: string;
        tipo_acomodacao_id: string;
        numero: string;
      }[] = [];

      for (const a of parsed.data.acomodacoes) {
        for (let i = 1; i <= a.quantidade; i++) {
          assentoRows.push({
            embarcacao_id: embarcacao.id,
            tipo_acomodacao_id: a.tipo_acomodacao_id,
            numero: String(i),
          });
        }
      }

      if (assentoRows.length > 0) {
        const { error: assentoError } = await supabase
          .from("assentos")
          .insert(assentoRows);

        if (assentoError)
          return { success: false, error: assentoError.message };
      }
    }
  }

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

  // Calcular capacidade total a partir das acomodacoes
  const capacidadeTotal =
    parsed.data.acomodacoes.length > 0
      ? parsed.data.acomodacoes.reduce((sum, a) => sum + a.quantidade, 0)
      : parsed.data.capacidade;

  // 1. Atualizar embarcacao
  const { error } = await supabase
    .from("embarcacoes")
    .update({
      nome: parsed.data.nome,
      capacidade: capacidadeTotal,
      tipo: parsed.data.tipo,
      controle_assentos: parsed.data.controle_assentos,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  // 2. Recriar capacidade_acomodacao (delete all + insert new)
  const { error: delCapError } = await supabase
    .from("capacidade_acomodacao")
    .delete()
    .eq("embarcacao_id", id);

  if (delCapError) return { success: false, error: delCapError.message };

  if (parsed.data.acomodacoes.length > 0) {
    const capacidadeRows = parsed.data.acomodacoes.map((a) => ({
      embarcacao_id: id,
      tipo_acomodacao_id: a.tipo_acomodacao_id,
      quantidade: a.quantidade,
    }));

    const { error: capError } = await supabase
      .from("capacidade_acomodacao")
      .insert(capacidadeRows);

    if (capError) return { success: false, error: capError.message };
  }

  // 3. Recriar assentos se controle_assentos ativo
  const { error: delAssentoError } = await supabase
    .from("assentos")
    .delete()
    .eq("embarcacao_id", id);

  if (delAssentoError)
    return { success: false, error: delAssentoError.message };

  if (parsed.data.controle_assentos && parsed.data.acomodacoes.length > 0) {
    const assentoRows: {
      embarcacao_id: string;
      tipo_acomodacao_id: string;
      numero: string;
    }[] = [];

    for (const a of parsed.data.acomodacoes) {
      for (let i = 1; i <= a.quantidade; i++) {
        assentoRows.push({
          embarcacao_id: id,
          tipo_acomodacao_id: a.tipo_acomodacao_id,
          numero: String(i),
        });
      }
    }

    if (assentoRows.length > 0) {
      const { error: assentoError } = await supabase
        .from("assentos")
        .insert(assentoRows);

      if (assentoError)
        return { success: false, error: assentoError.message };
    }
  }

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
  const { data: itinerario, error } = await supabase
    .from("itinerarios")
    .insert({
      nome: parsed.data.nome,
      descricao: parsed.data.descricao || null,
      origem: parsed.data.origem,
      destino: parsed.data.destino,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  // Auto-criar pontos de parada para origem e destino
  await supabase.from("pontos_parada").insert([
    {
      itinerario_id: itinerario.id,
      nome_local: parsed.data.origem,
      ordem: 1,
      duracao_parada_min: 0,
    },
    {
      itinerario_id: itinerario.id,
      nome_local: parsed.data.destino,
      ordem: 2,
      duracao_parada_min: 0,
    },
  ]);

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
      origem: parsed.data.origem,
      destino: parsed.data.destino,
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
