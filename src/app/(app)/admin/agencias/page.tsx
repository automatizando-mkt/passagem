import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Agencia } from "@/types";
import { AgenciasContent } from "./agencias-content";

export default async function AgenciasPage() {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("agencias")
    .select("*")
    .order("nome");

  return <AgenciasContent agencias={(data ?? []) as Agencia[]} />;
}
