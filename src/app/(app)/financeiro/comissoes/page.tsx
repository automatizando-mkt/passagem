import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Comissao, Passagem } from "@/types";
import { ComissoesContent } from "./comissoes-content";

interface ComissaoComDetalhes extends Comissao {
  vendedor_nome?: string;
  passageiro_nome?: string;
}

export default async function ComissoesPage() {
  const supabase = await createServerSupabaseClient();

  const [comissoesRes, passagensRes, profilesRes] = await Promise.all([
    supabase
      .from("comissoes")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase.from("passagens").select("id, nome_passageiro, valor_pago"),
    supabase.from("profiles").select("user_id, nome"),
  ]);

  const passagemMap = new Map(
    (passagensRes.data ?? []).map((p: { id: string; nome_passageiro: string; valor_pago: number }) => [p.id, p]),
  );
  const profileMap = new Map(
    (profilesRes.data ?? []).map((p: { user_id: string; nome: string }) => [p.user_id, p.nome]),
  );

  const comissoes: ComissaoComDetalhes[] = ((comissoesRes.data ?? []) as Comissao[]).map(
    (c) => ({
      ...c,
      vendedor_nome: profileMap.get(c.vendedor_id) ?? "—",
      passageiro_nome: passagemMap.get(c.passagem_id)?.nome_passageiro ?? "—",
    }),
  );

  return <ComissoesContent comissoes={comissoes} />;
}
