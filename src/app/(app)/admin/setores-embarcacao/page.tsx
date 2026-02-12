import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Embarcacao, SetorEmbarcacao } from "@/types";
import { SetoresContent } from "./setores-content";

export default async function SetoresEmbarcacaoPage() {
  const supabase = await createServerSupabaseClient();

  const [embarcacoesRes, setoresRes] = await Promise.all([
    supabase
      .from("embarcacoes")
      .select("*")
      .eq("ativa", true)
      .order("nome"),
    supabase
      .from("setores_embarcacao")
      .select("*")
      .order("nome"),
  ]);

  return (
    <SetoresContent
      setores={(setoresRes.data ?? []) as SetorEmbarcacao[]}
      embarcacoes={(embarcacoesRes.data ?? []) as Embarcacao[]}
    />
  );
}
