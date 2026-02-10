"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { Embarcacao, Itinerario, PontoParada } from "@/types";

export function useEmbarcacoes() {
  const supabase = createClient();
  return useQuery<Embarcacao[]>({
    queryKey: ["embarcacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("embarcacoes")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as Embarcacao[];
    },
  });
}

export function useItinerarios() {
  const supabase = createClient();
  return useQuery<Itinerario[]>({
    queryKey: ["itinerarios"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("itinerarios")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as Itinerario[];
    },
  });
}

export function usePontosParada(itinerarioId: string) {
  const supabase = createClient();
  return useQuery<PontoParada[]>({
    queryKey: ["pontos_parada", itinerarioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pontos_parada")
        .select("*")
        .eq("itinerario_id", itinerarioId)
        .order("ordem");
      if (error) throw error;
      return data as PontoParada[];
    },
    enabled: !!itinerarioId,
  });
}
