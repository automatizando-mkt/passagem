import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { TipoAcomodacao } from "@/types";
import { TiposAcomodacaoContent } from "./tipos-acomodacao-content";

export default async function TiposAcomodacaoPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("tipos_acomodacao")
    .select("*")
    .order("nome");

  return <TiposAcomodacaoContent tipos={(data ?? []) as TipoAcomodacao[]} />;
}
