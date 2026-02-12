import { createServerSupabaseClient } from "@/lib/supabase-server";
import { getRelatorioPorViagem, getRelatorioPassageiros } from "@/features/admin/relatorios/queries";
import type { Embarcacao, Itinerario } from "@/types";
import { RelatoriosContent } from "./relatorios-content";

export default async function RelatoriosPage() {
  const supabase = await createServerSupabaseClient();

  const [relatorio, passageiros, embarcacoesRes, itinerariosRes] = await Promise.all([
    getRelatorioPorViagem(),
    getRelatorioPassageiros(),
    supabase.from("embarcacoes").select("id, nome").order("nome"),
    supabase.from("itinerarios").select("id, nome").order("nome"),
  ]);

  return (
    <RelatoriosContent
      relatorio={relatorio}
      passageiros={passageiros}
      embarcacoes={(embarcacoesRes.data ?? []) as Pick<Embarcacao, "id" | "nome">[]}
      itinerarios={(itinerariosRes.data ?? []) as Pick<Itinerario, "id" | "nome">[]}
    />
  );
}
