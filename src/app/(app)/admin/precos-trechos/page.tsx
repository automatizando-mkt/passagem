import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { PrecoTrecho, Itinerario, PontoParada, TipoAcomodacao } from "@/types";
import { PrecosTrechosContent } from "./precos-trechos-content";

export default async function PrecosTrechosPage() {
  const supabase = await createServerSupabaseClient();

  const [precosRes, itinerariosRes, pontosRes, tiposRes] = await Promise.all([
    supabase
      .from("precos_trechos")
      .select("*")
      .order("vigencia_inicio", { ascending: false }),
    supabase
      .from("itinerarios")
      .select("*")
      .eq("ativo", true)
      .order("nome"),
    supabase
      .from("pontos_parada")
      .select("*")
      .order("ordem"),
    supabase
      .from("tipos_acomodacao")
      .select("*")
      .order("nome"),
  ]);

  return (
    <PrecosTrechosContent
      precos={(precosRes.data ?? []) as PrecoTrecho[]}
      itinerarios={(itinerariosRes.data ?? []) as Itinerario[]}
      pontos={(pontosRes.data ?? []) as PontoParada[]}
      tiposAcomodacao={(tiposRes.data ?? []) as TipoAcomodacao[]}
    />
  );
}
