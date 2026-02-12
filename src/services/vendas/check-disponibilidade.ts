import { createServerSupabaseClient } from "@/lib/supabase-server";

interface DisponibilidadeResult {
  disponivel: boolean;
  vagas_restantes: number;
  capacidade_total: number;
  ocupadas: number;
}

export async function checkDisponibilidade(
  viagemId: string,
  embarcacaoId: string,
  tipoAcomodacaoId: string,
): Promise<DisponibilidadeResult> {
  const supabase = await createServerSupabaseClient();

  // Buscar capacidade configurada
  const { data: capacidade } = await supabase
    .from("capacidade_acomodacao")
    .select("quantidade")
    .eq("embarcacao_id", embarcacaoId)
    .eq("tipo_acomodacao_id", tipoAcomodacaoId)
    .single();

  // Se nao tem capacidade configurada, considerar ilimitado
  if (!capacidade) {
    return { disponivel: true, vagas_restantes: -1, capacidade_total: -1, ocupadas: 0 };
  }

  // Contar passagens ativas para esta viagem + acomodacao
  const { count } = await supabase
    .from("passagens")
    .select("*", { count: "exact", head: true })
    .eq("viagem_id", viagemId)
    .eq("tipo_acomodacao_id", tipoAcomodacaoId)
    .not("status", "in", '("cancelada","reembolsada")');

  const ocupadas = count ?? 0;
  const vagas_restantes = capacidade.quantidade - ocupadas;

  return {
    disponivel: vagas_restantes > 0,
    vagas_restantes,
    capacidade_total: capacidade.quantidade,
    ocupadas,
  };
}
