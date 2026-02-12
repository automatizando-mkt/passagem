import { createServerSupabaseClient } from "@/lib/supabase-server";

interface RelatorioViagemRow {
  viagem_id: string;
  itinerario_nome: string;
  data_saida: string;
  embarcacao_nome: string;
  total_passagens: number;
  total_encomendas: number;
  receita_passagens: number;
  receita_fretes: number;
  total_despesas: number;
}

export async function getRelatorioPorViagem(): Promise<RelatorioViagemRow[]> {
  const supabase = await createServerSupabaseClient();

  const [viagensRes, itinerariosRes, embarcacoesRes, passagensRes, encomendasRes, despesasRes] =
    await Promise.all([
      supabase.from("viagens").select("id, itinerario_id, embarcacao_id, data_saida, status"),
      supabase.from("itinerarios").select("id, nome"),
      supabase.from("embarcacoes").select("id, nome"),
      supabase.from("passagens").select("viagem_id, valor_pago, status"),
      supabase.from("encomendas").select("viagem_id, valor"),
      supabase.from("despesas_viagem").select("viagem_id, valor"),
    ]);

  const itinMap = new Map((itinerariosRes.data ?? []).map((i: { id: string; nome: string }) => [i.id, i.nome]));
  const embMap = new Map((embarcacoesRes.data ?? []).map((e: { id: string; nome: string }) => [e.id, e.nome]));

  const passagensAtivas = (passagensRes.data ?? []).filter(
    (p: { status: string }) => p.status !== "cancelada" && p.status !== "reembolsada",
  );

  const viagens = viagensRes.data ?? [];

  return viagens.map((v: { id: string; itinerario_id: string; embarcacao_id: string; data_saida: string }) => {
    const vPassagens = passagensAtivas.filter((p: { viagem_id: string }) => p.viagem_id === v.id);
    const vEncomendas = (encomendasRes.data ?? []).filter((e: { viagem_id: string }) => e.viagem_id === v.id);
    const vDespesas = (despesasRes.data ?? []).filter((d: { viagem_id: string }) => d.viagem_id === v.id);

    return {
      viagem_id: v.id,
      itinerario_nome: itinMap.get(v.itinerario_id) ?? "—",
      data_saida: v.data_saida,
      embarcacao_nome: embMap.get(v.embarcacao_id) ?? "—",
      total_passagens: vPassagens.length,
      total_encomendas: vEncomendas.length,
      receita_passagens: vPassagens.reduce((s: number, p: { valor_pago: number }) => s + p.valor_pago, 0),
      receita_fretes: vEncomendas.reduce((s: number, e: { valor: number }) => s + e.valor, 0),
      total_despesas: vDespesas.reduce((s: number, d: { valor: number }) => s + d.valor, 0),
    };
  }).sort((a: RelatorioViagemRow, b: RelatorioViagemRow) => b.data_saida.localeCompare(a.data_saida));
}
