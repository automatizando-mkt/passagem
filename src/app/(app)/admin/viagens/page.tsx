import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Viagem, Embarcacao, Itinerario } from "@/types";
import { ViagensContent } from "./viagens-content";

export default async function ViagensPage() {
  const supabase = await createServerSupabaseClient();

  const [viagensRes, embarcacoesRes, itinerariosRes] = await Promise.all([
    supabase
      .from("viagens")
      .select("*")
      .order("data_saida", { ascending: false }),
    supabase
      .from("embarcacoes")
      .select("*")
      .eq("ativa", true)
      .order("nome"),
    supabase
      .from("itinerarios")
      .select("*")
      .eq("ativo", true)
      .order("nome"),
  ]);

  return (
    <ViagensContent
      viagens={(viagensRes.data ?? []) as Viagem[]}
      embarcacoes={(embarcacoesRes.data ?? []) as Embarcacao[]}
      itinerarios={(itinerariosRes.data ?? []) as Itinerario[]}
    />
  );
}
