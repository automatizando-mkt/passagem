import { createServerSupabaseClient } from "@/lib/supabase-server";
import type {
  Passagem,
  Viagem,
  Itinerario,
  Embarcacao,
  TipoAcomodacao,
  PontoParada,
} from "@/types";
import { PassagensContent } from "./passagens-content";

export default async function PassagensPage() {
  const supabase = await createServerSupabaseClient();

  const [passagensRes, viagensRes, itinerariosRes, embarcacoesRes, tiposRes, pontosRes] =
    await Promise.all([
      supabase
        .from("passagens")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("viagens")
        .select("*")
        .order("data_saida", { ascending: false }),
      supabase.from("itinerarios").select("*").order("nome"),
      supabase.from("embarcacoes").select("*").order("nome"),
      supabase.from("tipos_acomodacao").select("*").order("nome"),
      supabase.from("pontos_parada").select("*").order("ordem"),
    ]);

  return (
    <PassagensContent
      passagens={(passagensRes.data ?? []) as Passagem[]}
      viagens={(viagensRes.data ?? []) as Viagem[]}
      itinerarios={(itinerariosRes.data ?? []) as Itinerario[]}
      embarcacoes={(embarcacoesRes.data ?? []) as Embarcacao[]}
      tiposAcomodacao={(tiposRes.data ?? []) as TipoAcomodacao[]}
      pontosParada={(pontosRes.data ?? []) as PontoParada[]}
    />
  );
}
