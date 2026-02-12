"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ActionResult, StatusEncomenda } from "@/types";
import { encomendaFormSchema, type EncomendaFormData } from "./schemas";

type CreateEncomendaResult =
  | { success: true; encomenda_id: string }
  | { success: false; error: string };

export async function createEncomenda(
  data: EncomendaFormData,
): Promise<CreateEncomendaResult> {
  const parsed = encomendaFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();

  // Buscar usuario autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Usuario nao autenticado" };

  // Verificar se viagem esta disponivel
  const { data: viagem, error: viagemError } = await supabase
    .from("viagens")
    .select("id, status")
    .eq("id", parsed.data.viagem_id)
    .single();

  if (viagemError || !viagem)
    return { success: false, error: "Viagem nao encontrada" };

  if (viagem.status !== "programada" && viagem.status !== "embarque")
    return { success: false, error: "Viagem nao esta disponivel para frete" };

  // Parse peso_kg: string -> number | null
  const pesoStr = parsed.data.peso_kg.trim();
  const pesoKg = pesoStr ? parseFloat(pesoStr) : null;
  if (pesoKg !== null && isNaN(pesoKg))
    return { success: false, error: "Peso invalido" };

  // Parse setor_id: empty string -> null
  const setorId = parsed.data.setor_id.trim() || null;

  // Inserir encomenda
  const { data: encomenda, error: encomendaError } = await supabase
    .from("encomendas")
    .insert({
      viagem_id: parsed.data.viagem_id,
      remetente: parsed.data.remetente,
      destinatario: parsed.data.destinatario,
      descricao: parsed.data.descricao,
      peso_kg: pesoKg,
      valor: parsed.data.valor,
      setor_id: setorId,
      status: "recebida",
    })
    .select("id")
    .single();

  if (encomendaError)
    return { success: false, error: encomendaError.message };

  // Inserir transacao financeira
  await supabase.from("transacoes").insert({
    tipo: "frete",
    referencia_id: encomenda.id,
    valor: parsed.data.valor,
    metodo_pagamento: parsed.data.metodo_pagamento,
  });

  revalidatePath("/vendas/encomendas");
  return { success: true, encomenda_id: encomenda.id };
}

export async function updateEncomendaStatus(
  id: string,
  status: StatusEncomenda,
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("encomendas")
    .update({ status })
    .eq("id", id);

  if (error) return { success: false, error: error.message };
  revalidatePath("/vendas/encomendas");
  return { success: true };
}
