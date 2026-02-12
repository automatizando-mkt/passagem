"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ActionResult } from "@/types";
import { despesaViagemFormSchema, type DespesaViagemFormData } from "./schemas";

export async function createDespesaViagem(
  data: DespesaViagemFormData,
): Promise<ActionResult> {
  const parsed = despesaViagemFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase.from("despesas_viagem").insert({
    viagem_id: parsed.data.viagem_id,
    descricao: parsed.data.descricao,
    valor: parsed.data.valor,
    categoria: parsed.data.categoria,
  });

  if (error) return { success: false, error: error.message };

  // Registrar transacao financeira
  await supabase.from("transacoes").insert({
    tipo: "despesa",
    valor: parsed.data.valor,
    metodo_pagamento: "dinheiro",
  });

  revalidatePath("/financeiro/despesas");
  return { success: true };
}

export async function updateDespesaViagem(
  id: string,
  data: DespesaViagemFormData,
): Promise<ActionResult> {
  const parsed = despesaViagemFormSchema.safeParse(data);
  if (!parsed.success)
    return { success: false, error: parsed.error.issues[0].message };

  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from("despesas_viagem")
    .update({
      viagem_id: parsed.data.viagem_id,
      descricao: parsed.data.descricao,
      valor: parsed.data.valor,
      categoria: parsed.data.categoria,
    })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/financeiro/despesas");
  return { success: true };
}

export async function deleteDespesaViagem(id: string): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase
    .from("despesas_viagem")
    .delete()
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/financeiro/despesas");
  return { success: true };
}
