import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Embarcacao } from "@/types";
import { EmbarcacoesContent } from "./embarcacoes-content";

export default async function EmbarcacoesPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("embarcacoes")
    .select("*")
    .order("nome");

  return <EmbarcacoesContent embarcacoes={(data ?? []) as Embarcacao[]} />;
}
