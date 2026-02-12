"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { Comissao } from "@/types";

export function useComissoes() {
  const supabase = createClient();
  return useQuery<Comissao[]>({
    queryKey: ["comissoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comissoes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Comissao[];
    },
  });
}
