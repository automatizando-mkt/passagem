import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Transacao } from "@/types";
import { TransacoesContent } from "./transacoes-content";

export default async function TransacoesPage() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("transacoes")
    .select("*")
    .order("created_at", { ascending: false });

  return <TransacoesContent transacoes={(data ?? []) as Transacao[]} />;
}
