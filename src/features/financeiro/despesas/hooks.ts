"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { DespesaViagem } from "@/types";

export function useDespesasViagem() {
  const supabase = createClient();
  return useQuery<DespesaViagem[]>({
    queryKey: ["despesas_viagem"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("despesas_viagem")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as DespesaViagem[];
    },
  });
}
