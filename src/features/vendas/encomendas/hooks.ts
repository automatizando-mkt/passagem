"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { Encomenda } from "@/types";

export function useEncomendas() {
  const supabase = createClient();
  return useQuery<Encomenda[]>({
    queryKey: ["encomendas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("encomendas")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Encomenda[];
    },
  });
}

export function useEncomendasByViagem(viagemId: string) {
  const supabase = createClient();
  return useQuery<Encomenda[]>({
    queryKey: ["encomendas", viagemId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("encomendas")
        .select("*")
        .eq("viagem_id", viagemId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Encomenda[];
    },
    enabled: !!viagemId,
  });
}
