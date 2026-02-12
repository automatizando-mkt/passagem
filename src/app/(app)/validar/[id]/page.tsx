import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { Passagem, Viagem, Itinerario } from "@/types";
import { ValidarContent } from "./validar-content";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ValidarPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  // Buscar passagem
  const { data: passagem } = await supabase
    .from("passagens")
    .select("*")
    .eq("id", id)
    .single<Passagem>();

  if (!passagem) {
    notFound();
  }

  // Buscar viagem e itinerario para montar info
  const { data: viagem } = await supabase
    .from("viagens")
    .select("*")
    .eq("id", passagem.viagem_id)
    .single<Viagem>();

  let viagemInfo = "—";

  if (viagem) {
    const { data: itinerario } = await supabase
      .from("itinerarios")
      .select("*")
      .eq("id", viagem.itinerario_id)
      .single<Itinerario>();

    const dataSaida = new Date(viagem.data_saida).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    viagemInfo = `${itinerario?.nome ?? "—"} - ${dataSaida}`;
  }

  return <ValidarContent passagem={passagem} viagemInfo={viagemInfo} />;
}
