import { createServerSupabaseClient } from "@/lib/supabase-server";
import type {
  Viagem,
  Embarcacao,
  Itinerario,
  TipoAcomodacao,
  CapacidadeAcomodacao,
  Assento,
} from "@/types";
import { VendasContent } from "./vendas-content";

export interface OcupacaoRecord {
  viagem_id: string;
  tipo_acomodacao_id: string;
  count: number;
}

export interface AssentoOcupado {
  viagem_id: string;
  tipo_acomodacao_id: string;
  assento: string;
}

export default async function VendasPage() {
  const supabase = await createServerSupabaseClient();

  const [viagensRes, embarcacoesRes, itinerariosRes, tiposRes, capacidadeRes, assentosRes] =
    await Promise.all([
      supabase
        .from("viagens")
        .select("*")
        .in("status", ["programada", "embarque"])
        .order("data_saida", { ascending: true }),
      supabase
        .from("embarcacoes")
        .select("*")
        .eq("ativa", true)
        .order("nome"),
      supabase.from("itinerarios").select("*").eq("ativo", true).order("nome"),
      supabase.from("tipos_acomodacao").select("*").order("nome"),
      supabase.from("capacidade_acomodacao").select("*"),
      supabase.from("assentos").select("*").order("numero"),
    ]);

  const viagens = (viagensRes.data ?? []) as Viagem[];

  // Fetch active passagens count per viagem per tipo_acomodacao
  // (excluding cancelada and reembolsada)
  const viagemIds = viagens.map((v) => v.id);
  let ocupacao: OcupacaoRecord[] = [];

  let assentosOcupados: AssentoOcupado[] = [];

  if (viagemIds.length > 0) {
    const { data: passagens } = await supabase
      .from("passagens")
      .select("viagem_id, tipo_acomodacao_id, assento")
      .in("viagem_id", viagemIds)
      .not("status", "in", '("cancelada","reembolsada")');

    // Aggregate counts manually
    const countMap = new Map<string, number>();
    for (const p of passagens ?? []) {
      const key = `${p.viagem_id}::${p.tipo_acomodacao_id}`;
      countMap.set(key, (countMap.get(key) ?? 0) + 1);

      // Collect occupied seats
      if (p.assento) {
        assentosOcupados.push({
          viagem_id: p.viagem_id,
          tipo_acomodacao_id: p.tipo_acomodacao_id,
          assento: p.assento,
        });
      }
    }

    ocupacao = Array.from(countMap.entries()).map(([key, count]) => {
      const [viagem_id, tipo_acomodacao_id] = key.split("::");
      return { viagem_id, tipo_acomodacao_id, count };
    });
  }

  return (
    <VendasContent
      viagens={viagens}
      embarcacoes={(embarcacoesRes.data ?? []) as Embarcacao[]}
      itinerarios={(itinerariosRes.data ?? []) as Itinerario[]}
      tiposAcomodacao={(tiposRes.data ?? []) as TipoAcomodacao[]}
      capacidades={(capacidadeRes.data ?? []) as CapacidadeAcomodacao[]}
      assentos={(assentosRes.data ?? []) as Assento[]}
      assentosOcupados={assentosOcupados}
      ocupacao={ocupacao}
    />
  );
}
