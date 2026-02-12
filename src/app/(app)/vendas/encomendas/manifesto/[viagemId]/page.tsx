import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Encomenda, Viagem, Itinerario, Embarcacao } from "@/types";
import { ManifestoContent } from "./manifesto-content";

export default async function ManifestoPage({
  params,
}: {
  params: Promise<{ viagemId: string }>;
}) {
  const { viagemId } = await params;
  const supabase = await createServerSupabaseClient();

  const [viagemRes, encomendasRes] = await Promise.all([
    supabase.from("viagens").select("*").eq("id", viagemId).single(),
    supabase
      .from("encomendas")
      .select("*")
      .eq("viagem_id", viagemId)
      .order("created_at"),
  ]);

  const viagem = viagemRes.data as Viagem | null;
  if (!viagem) {
    return <p className="p-8 text-muted-foreground">Viagem nao encontrada.</p>;
  }

  const [itinerarioRes, embarcacaoRes] = await Promise.all([
    supabase
      .from("itinerarios")
      .select("*")
      .eq("id", viagem.itinerario_id)
      .single(),
    supabase
      .from("embarcacoes")
      .select("*")
      .eq("id", viagem.embarcacao_id)
      .single(),
  ]);

  return (
    <ManifestoContent
      viagem={viagem}
      itinerario={(itinerarioRes.data as Itinerario) ?? null}
      embarcacao={(embarcacaoRes.data as Embarcacao) ?? null}
      encomendas={(encomendasRes.data ?? []) as Encomenda[]}
    />
  );
}
