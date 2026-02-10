"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { Viagem } from "@/types";

export function useViagens() {
  const supabase = createClient();
  return useQuery<Viagem[]>({
    queryKey: ["viagens"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("viagens")
        .select("*")
        .order("data_saida", { ascending: false });
      if (error) throw error;
      return data as Viagem[];
    },
  });
}
