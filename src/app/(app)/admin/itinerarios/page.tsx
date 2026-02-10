import { createServerSupabaseClient } from "@/lib/supabase-server";
import { ItinerariosContent } from "./itinerarios-content";

interface ItinerarioWithCount {
  id: string;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  created_at: string;
  pontos_parada: { count: number }[];
}

export default async function ItinerariosPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("itinerarios")
    .select("id, nome, descricao, ativo, created_at, pontos_parada(count)")
    .order("nome");

  const itinerarios = ((data ?? []) as ItinerarioWithCount[]).map((it) => ({
    ...it,
    pontosCount: it.pontos_parada?.[0]?.count ?? 0,
  }));

  return <ItinerariosContent itinerarios={itinerarios} />;
}
