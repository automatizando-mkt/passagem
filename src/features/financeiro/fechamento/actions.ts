"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { ActionResult } from "@/types";

interface FechamentoPreview {
  total_vendas: number;
  total_despesas: number;
  saldo: number;
  transacoes_count: number;
}

export async function getFechamentoPreview(
  date: string,
): Promise<FechamentoPreview> {
  const supabase = await createServerSupabaseClient();
  const startOfDay = `${date}T00:00:00.000Z`;
  const endOfDay = `${date}T23:59:59.999Z`;

  // Buscar transacoes do dia
  const { data: transacoes } = await supabase
    .from("transacoes")
    .select("tipo, valor")
    .gte("created_at", startOfDay)
    .lte("created_at", endOfDay);

  const items = transacoes ?? [];
  const total_vendas = items
    .filter((t) => t.tipo === "passagem" || t.tipo === "frete")
    .reduce((sum, t) => sum + t.valor, 0);
  const total_despesas = items
    .filter((t) => t.tipo === "despesa")
    .reduce((sum, t) => sum + t.valor, 0);

  return {
    total_vendas,
    total_despesas,
    saldo: total_vendas - total_despesas,
    transacoes_count: items.length,
  };
}

export async function createFechamentoCaixa(
  data: { data_fechamento: string; observacoes: string },
): Promise<ActionResult> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Usuario nao autenticado" };

  // Verificar se ja existe fechamento para esta data
  const { data: existing } = await supabase
    .from("fechamento_caixa")
    .select("id")
    .eq("data_fechamento", data.data_fechamento)
    .maybeSingle();

  if (existing)
    return { success: false, error: "Ja existe fechamento para esta data" };

  // Calcular preview
  const preview = await getFechamentoPreview(data.data_fechamento);

  const { error } = await supabase.from("fechamento_caixa").insert({
    data_fechamento: data.data_fechamento,
    operador_id: user.id,
    total_vendas: preview.total_vendas,
    total_despesas: preview.total_despesas,
    saldo: preview.saldo,
    observacoes: data.observacoes || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/financeiro/fechamento");
  return { success: true };
}
