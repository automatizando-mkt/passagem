import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Encomenda, Viagem } from "@/types";
import { ReciboContent } from "./recibo-content";

export default async function ReciboPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: encomenda } = await supabase
    .from("encomendas")
    .select("*")
    .eq("id", id)
    .single();

  if (!encomenda) {
    return <p className="p-8 text-muted-foreground">Encomenda nao encontrada.</p>;
  }

  const enc = encomenda as Encomenda;

  const { data: viagem } = await supabase
    .from("viagens")
    .select("*")
    .eq("id", enc.viagem_id)
    .single();

  let itinerarioNome = "—";
  if (viagem) {
    const { data: itin } = await supabase
      .from("itinerarios")
      .select("nome")
      .eq("id", (viagem as Viagem).itinerario_id)
      .single();
    itinerarioNome = itin?.nome ?? "—";
  }

  return (
    <ReciboContent
      encomenda={enc}
      viagem={(viagem as Viagem) ?? null}
      itinerarioNome={itinerarioNome}
    />
  );
}
