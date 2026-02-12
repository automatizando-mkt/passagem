"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { FechamentoCaixa } from "@/types";

export function useFechamentos() {
  const supabase = createClient();
  return useQuery<FechamentoCaixa[]>({
    queryKey: ["fechamento_caixa"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fechamento_caixa")
        .select("*")
        .order("data_fechamento", { ascending: false });
      if (error) throw error;
      return data as FechamentoCaixa[];
    },
  });
}
