"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { Passagem } from "@/types";

export function useViagensDisponiveis() {
  const supabase = createClient();
  return useQuery({
    queryKey: ["viagens_disponiveis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viagens")
        .select("*")
        .in("status", ["programada", "embarque"])
        .order("data_saida", { ascending: true });
      if (error) throw error;
      return data;
    },
  });
}

export function usePassagensByViagem(viagemId: string) {
  const supabase = createClient();
  return useQuery<Passagem[]>({
    queryKey: ["passagens", viagemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("passagens")
        .select("*")
        .eq("viagem_id", viagemId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Passagem[];
    },
    enabled: !!viagemId,
  });
}

export function usePassagens() {
  const supabase = createClient();
  return useQuery<Passagem[]>({
    queryKey: ["passagens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("passagens")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Passagem[];
    },
  });
}
