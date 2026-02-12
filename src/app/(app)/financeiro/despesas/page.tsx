import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { DespesaViagem, Viagem, Itinerario } from "@/types";
import { DespesasContent } from "./despesas-content";

export default async function DespesasPage() {
  const supabase = await createServerSupabaseClient();

  const [despesasRes, viagensRes, itinerariosRes] = await Promise.all([
    supabase
      .from("despesas_viagem")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("viagens")
      .select("*")
      .order("data_saida", { ascending: false }),
    supabase.from("itinerarios").select("*").order("nome"),
  ]);

  return (
    <DespesasContent
      despesas={(despesasRes.data ?? []) as DespesaViagem[]}
      viagens={(viagensRes.data ?? []) as Viagem[]}
      itinerarios={(itinerariosRes.data ?? []) as Itinerario[]}
    />
  );
}
