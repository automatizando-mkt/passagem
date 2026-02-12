"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { SetorEmbarcacao } from "@/types";

export function useSetoresEmbarcacao(embarcacaoId?: string) {
  const supabase = createClient();
  return useQuery<SetorEmbarcacao[]>({
    queryKey: ["setores_embarcacao", embarcacaoId],
    queryFn: async () => {
      let query = supabase
        .from("setores_embarcacao")
        .select("*")
        .order("nome");
      if (embarcacaoId) {
        query = query.eq("embarcacao_id", embarcacaoId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as SetorEmbarcacao[];
    },
  });
}
