import { createServerSupabaseClient } from "@/lib/supabase-server";

export interface DashboardMetrics {
  totalReceita: number;
  totalPassagens: number;
  totalViagensAtivas: number;
  totalEncomendas: number;
  receitaPorDia: { date: string; valor: number }[];
  receitaPorMetodo: { metodo: string; valor: number }[];
  viagensPorStatus: { status: string; count: number }[];
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const supabase = await createServerSupabaseClient();

  // Periodo: ultimos 30 dias
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const startDate = thirtyDaysAgo.toISOString();

  const [transacoesRes, passagensRes, viagensRes, encomendasRes] =
    await Promise.all([
      supabase
        .from("transacoes")
        .select("tipo, valor, metodo_pagamento, created_at")
        .gte("created_at", startDate)
        .in("tipo", ["passagem", "frete"]),
      supabase
        .from("passagens")
        .select("id, status, created_at")
        .gte("created_at", startDate),
      supabase.from("viagens").select("id, status"),
      supabase
        .from("encomendas")
        .select("id")
        .gte("created_at", startDate),
    ]);

  const transacoes = transacoesRes.data ?? [];
  const passagens = passagensRes.data ?? [];
  const viagens = viagensRes.data ?? [];
  const encomendas = encomendasRes.data ?? [];

  // Total receita
  const totalReceita = transacoes.reduce((sum, t) => sum + t.valor, 0);

  // Passagens confirmadas/utilizadas
  const totalPassagens = passagens.filter(
    (p) => p.status === "confirmada" || p.status === "utilizada",
  ).length;

  // Viagens ativas
  const totalViagensAtivas = viagens.filter(
    (v) =>
      v.status === "programada" ||
      v.status === "embarque" ||
      v.status === "em_viagem",
  ).length;

  // Total encomendas
  const totalEncomendas = encomendas.length;

  // Receita por dia (ultimos 30 dias)
  const receitaPorDiaMap = new Map<string, number>();
  for (const t of transacoes) {
    const date = t.created_at.split("T")[0];
    receitaPorDiaMap.set(date, (receitaPorDiaMap.get(date) ?? 0) + t.valor);
  }
  const receitaPorDia = Array.from(receitaPorDiaMap.entries())
    .map(([date, valor]) => ({ date, valor }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Receita por metodo
  const receitaPorMetodoMap = new Map<string, number>();
  for (const t of transacoes) {
    receitaPorMetodoMap.set(
      t.metodo_pagamento,
      (receitaPorMetodoMap.get(t.metodo_pagamento) ?? 0) + t.valor,
    );
  }
  const receitaPorMetodo = Array.from(receitaPorMetodoMap.entries()).map(
    ([metodo, valor]) => ({ metodo, valor }),
  );

  // Viagens por status
  const viagensPorStatusMap = new Map<string, number>();
  for (const v of viagens) {
    viagensPorStatusMap.set(
      v.status,
      (viagensPorStatusMap.get(v.status) ?? 0) + 1,
    );
  }
  const viagensPorStatus = Array.from(viagensPorStatusMap.entries()).map(
    ([status, count]) => ({ status, count }),
  );

  return {
    totalReceita,
    totalPassagens,
    totalViagensAtivas,
    totalEncomendas,
    receitaPorDia,
    receitaPorMetodo,
    viagensPorStatus,
  };
}
