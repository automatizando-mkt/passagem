"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { CapacidadeAcomodacao } from "@/types";

export function useCapacidadeByEmbarcacao(embarcacaoId: string) {
  const supabase = createClient();
  return useQuery<CapacidadeAcomodacao[]>({
    queryKey: ["capacidade_acomodacao", embarcacaoId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("capacidade_acomodacao")
        .select("*")
        .eq("embarcacao_id", embarcacaoId);
      if (error) throw error;
      return data as CapacidadeAcomodacao[];
    },
    enabled: !!embarcacaoId,
  });
}
