import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Embarcacao, CapacidadeAcomodacao, TipoAcomodacao } from "@/types";
import { EmbarcacaoDetailContent } from "./embarcacao-detail-content";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EmbarcacaoDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const [embarcacaoRes, capacidadesRes, tiposRes] = await Promise.all([
    supabase.from("embarcacoes").select("*").eq("id", id).single(),
    supabase
      .from("capacidade_acomodacao")
      .select("*")
      .eq("embarcacao_id", id),
    supabase.from("tipos_acomodacao").select("*").order("nome"),
  ]);

  if (!embarcacaoRes.data) notFound();

  return (
    <EmbarcacaoDetailContent
      embarcacao={embarcacaoRes.data as Embarcacao}
      capacidades={(capacidadesRes.data ?? []) as CapacidadeAcomodacao[]}
      tiposAcomodacao={(tiposRes.data ?? []) as TipoAcomodacao[]}
    />
  );
}
