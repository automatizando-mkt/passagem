import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Embarcacao, TipoAcomodacao, CapacidadeAcomodacao } from "@/types";
import { EmbarcacoesContent } from "./embarcacoes-content";

export default async function EmbarcacoesPage() {
  const supabase = await createServerSupabaseClient();

  const [embarcacoesRes, tiposRes, capacidadesRes] = await Promise.all([
    supabase.from("embarcacoes").select("*").order("nome"),
    supabase.from("tipos_acomodacao").select("*").order("nome"),
    supabase.from("capacidade_acomodacao").select("*"),
  ]);

  return (
    <EmbarcacoesContent
      embarcacoes={(embarcacoesRes.data ?? []) as Embarcacao[]}
      tiposAcomodacao={(tiposRes.data ?? []) as TipoAcomodacao[]}
      capacidades={(capacidadesRes.data ?? []) as CapacidadeAcomodacao[]}
    />
  );
}
