import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { FechamentoCaixa } from "@/types";
import { FechamentoContent } from "./fechamento-content";

export default async function FechamentoPage() {
  const supabase = await createServerSupabaseClient();

  const { data } = await supabase
    .from("fechamento_caixa")
    .select("*")
    .order("data_fechamento", { ascending: false });

  // Buscar nomes dos operadores
  const fechamentos = (data ?? []) as FechamentoCaixa[];
  const operadorIds = [...new Set(fechamentos.map((f) => f.operador_id))];

  let operadorMap: Record<string, string> = {};
  if (operadorIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, nome")
      .in("user_id", operadorIds);
    operadorMap = Object.fromEntries(
      (profiles ?? []).map((p: { user_id: string; nome: string }) => [p.user_id, p.nome]),
    );
  }

  return (
    <FechamentoContent
      fechamentos={fechamentos}
      operadorMap={operadorMap}
    />
  );
}
