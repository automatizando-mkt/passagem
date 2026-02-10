import { createServerSupabaseClient } from "@/lib/supabase-server";

interface GetPriceParams {
  itinerarioId: string;
  pontoOrigemId: string;
  pontoDestinoId: string;
  tipoAcomodacaoId: string;
}

interface PriceResult {
  preco: number;
  vigencia_inicio: string;
  vigencia_fim: string | null;
}

export async function getPrice(
  params: GetPriceParams,
): Promise<PriceResult | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from("precos_trechos")
    .select("preco, vigencia_inicio, vigencia_fim")
    .eq("itinerario_id", params.itinerarioId)
    .eq("ponto_origem_id", params.pontoOrigemId)
    .eq("ponto_destino_id", params.pontoDestinoId)
    .eq("tipo_acomodacao_id", params.tipoAcomodacaoId)
    .lte("vigencia_inicio", new Date().toISOString())
    .or("vigencia_fim.is.null,vigencia_fim.gte." + new Date().toISOString())
    .order("vigencia_inicio", { ascending: false })
    .limit(1)
    .single<PriceResult>();

  if (error || !data) return null;

  return {
    preco: Number(data.preco),
    vigencia_inicio: data.vigencia_inicio,
    vigencia_fim: data.vigencia_fim,
  };
}
