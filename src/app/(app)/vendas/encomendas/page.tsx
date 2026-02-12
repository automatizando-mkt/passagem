import { createServerSupabaseClient } from "@/lib/supabase-server";
import type {
  Encomenda,
  Viagem,
  Itinerario,
  Embarcacao,
  SetorEmbarcacao,
} from "@/types";
import { EncomendasContent } from "./encomendas-content";

export default async function EncomendasPage() {
  const supabase = await createServerSupabaseClient();

  const [encomendasRes, viagensRes, itinerariosRes, embarcacoesRes, setoresRes] =
    await Promise.all([
      supabase
        .from("encomendas")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("viagens")
        .select("*")
        .order("data_saida", { ascending: false }),
      supabase.from("itinerarios").select("*").order("nome"),
      supabase.from("embarcacoes").select("*").order("nome"),
      supabase.from("setores_embarcacao").select("*").order("nome"),
    ]);

  return (
    <EncomendasContent
      encomendas={(encomendasRes.data ?? []) as Encomenda[]}
      viagens={(viagensRes.data ?? []) as Viagem[]}
      itinerarios={(itinerariosRes.data ?? []) as Itinerario[]}
      embarcacoes={(embarcacoesRes.data ?? []) as Embarcacao[]}
      setores={(setoresRes.data ?? []) as SetorEmbarcacao[]}
    />
  );
}
