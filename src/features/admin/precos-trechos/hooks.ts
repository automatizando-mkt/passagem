"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { PrecoTrecho } from "@/types";

export function usePrecosTrechos(itinerarioId?: string) {
  const supabase = createClient();
  return useQuery<PrecoTrecho[]>({
    queryKey: ["precos_trechos", itinerarioId],
    queryFn: async () => {
      let query = supabase
        .from("precos_trechos")
        .select("*")
        .order("vigencia_inicio", { ascending: false });

      if (itinerarioId) {
        query = query.eq("itinerario_id", itinerarioId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as PrecoTrecho[];
    },
  });
}
