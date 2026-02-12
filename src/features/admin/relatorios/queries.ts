import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { StatusPassagem } from "@/types";

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

// --- Relatório de Passageiros ---

export interface RelatorioPassageiroRow {
  passagem_id: string;
  nome_passageiro: string;
  documento: string;
  data_saida: string;
  itinerario_nome: string;
  embarcacao_nome: string;
  embarque: string;
  desembarque: string;
  acomodacao: string;
  assento: string | null;
  valor_pago: number;
  status: StatusPassagem;
}

export async function getRelatorioPassageiros(): Promise<RelatorioPassageiroRow[]> {
  const supabase = await createServerSupabaseClient();

  const [passagensRes, viagensRes, itinerariosRes, embarcacoesRes, pontosRes, tiposRes] =
    await Promise.all([
      supabase.from("passagens").select("id, viagem_id, nome_passageiro, documento, tipo_acomodacao_id, ponto_embarque_id, ponto_desembarque_id, assento, valor_pago, status"),
      supabase.from("viagens").select("id, itinerario_id, embarcacao_id, data_saida"),
      supabase.from("itinerarios").select("id, nome"),
      supabase.from("embarcacoes").select("id, nome"),
      supabase.from("pontos_parada").select("id, nome_local"),
      supabase.from("tipos_acomodacao").select("id, nome"),
    ]);

  const viagemMap = new Map(
    (viagensRes.data ?? []).map((v: { id: string; itinerario_id: string; embarcacao_id: string; data_saida: string }) => [v.id, v]),
  );
  const itinMap = new Map((itinerariosRes.data ?? []).map((i: { id: string; nome: string }) => [i.id, i.nome]));
  const embMap = new Map((embarcacoesRes.data ?? []).map((e: { id: string; nome: string }) => [e.id, e.nome]));
  const pontoMap = new Map((pontosRes.data ?? []).map((p: { id: string; nome_local: string }) => [p.id, p.nome_local]));
  const tipoMap = new Map((tiposRes.data ?? []).map((t: { id: string; nome: string }) => [t.id, t.nome]));

  return (passagensRes.data ?? [])
    .map((p: {
      id: string;
      viagem_id: string;
      nome_passageiro: string;
      documento: string;
      tipo_acomodacao_id: string;
      ponto_embarque_id: string;
      ponto_desembarque_id: string;
      assento: string | null;
      valor_pago: number;
      status: StatusPassagem;
    }) => {
      const viagem = viagemMap.get(p.viagem_id) as { itinerario_id: string; embarcacao_id: string; data_saida: string } | undefined;
      return {
        passagem_id: p.id,
        nome_passageiro: p.nome_passageiro,
        documento: p.documento,
        data_saida: viagem?.data_saida ?? "",
        itinerario_nome: viagem ? (itinMap.get(viagem.itinerario_id) ?? "—") : "—",
        embarcacao_nome: viagem ? (embMap.get(viagem.embarcacao_id) ?? "—") : "—",
        embarque: pontoMap.get(p.ponto_embarque_id) ?? "—",
        desembarque: pontoMap.get(p.ponto_desembarque_id) ?? "—",
        acomodacao: tipoMap.get(p.tipo_acomodacao_id) ?? "—",
        assento: p.assento,
        valor_pago: p.valor_pago,
        status: p.status,
      };
    })
    .sort((a: RelatorioPassageiroRow, b: RelatorioPassageiroRow) => b.data_saida.localeCompare(a.data_saida));
}
