import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Itinerario, PontoParada } from "@/types";
import { ItinerarioDetailContent } from "./itinerario-detail-content";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ItinerarioDetailPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: itinerario } = await supabase
    .from("itinerarios")
    .select("*")
    .eq("id", id)
    .single<Itinerario>();

  if (!itinerario) {
    notFound();
  }

  const { data: pontos } = await supabase
    .from("pontos_parada")
    .select("*")
    .eq("itinerario_id", id)
    .order("ordem");

  return (
    <ItinerarioDetailContent
      itinerario={itinerario}
      pontos={(pontos ?? []) as PontoParada[]}
    />
  );
}
