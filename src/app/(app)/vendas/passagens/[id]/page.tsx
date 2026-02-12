import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generateQRDataURL } from "@/lib/qr-code";
import type {
  Passagem,
  Viagem,
  Itinerario,
  Embarcacao,
  TipoAcomodacao,
  PontoParada,
} from "@/types";
import { BilheteContent } from "./bilhete-content";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function BilhetePage({ params }: Props) {
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

  // Buscar dados relacionados em paralelo
  const [viagemRes, tipoAcomodacaoRes, embarqueRes, desembarqueRes] =
    await Promise.all([
      supabase
        .from("viagens")
        .select("*")
        .eq("id", passagem.viagem_id)
        .single<Viagem>(),
      supabase
        .from("tipos_acomodacao")
        .select("*")
        .eq("id", passagem.tipo_acomodacao_id)
        .single<TipoAcomodacao>(),
      supabase
        .from("pontos_parada")
        .select("*")
        .eq("id", passagem.ponto_embarque_id)
        .single<PontoParada>(),
      supabase
        .from("pontos_parada")
        .select("*")
        .eq("id", passagem.ponto_desembarque_id)
        .single<PontoParada>(),
    ]);

  const viagem = viagemRes.data;
  if (!viagem) {
    notFound();
  }

  // Buscar itinerario e embarcacao da viagem
  const [itinerarioRes, embarcacaoRes] = await Promise.all([
    supabase
      .from("itinerarios")
      .select("*")
      .eq("id", viagem.itinerario_id)
      .single<Itinerario>(),
    supabase
      .from("embarcacoes")
      .select("*")
      .eq("id", viagem.embarcacao_id)
      .single<Embarcacao>(),
  ]);

  // Gerar QR Code
  const qrCodeUrl = await generateQRDataURL(passagem.id);

  return (
    <BilheteContent
      passagem={passagem}
      viagem={viagem}
      itinerarioNome={itinerarioRes.data?.nome ?? "—"}
      embarcacaoNome={embarcacaoRes.data?.nome ?? "—"}
      tipoAcomodacaoNome={tipoAcomodacaoRes.data?.nome ?? "—"}
      embarqueNome={embarqueRes.data?.nome_local ?? "—"}
      desembarqueNome={desembarqueRes.data?.nome_local ?? "—"}
      qrCodeUrl={qrCodeUrl}
    />
  );
}
