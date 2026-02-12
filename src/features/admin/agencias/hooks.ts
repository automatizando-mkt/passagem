"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { Agencia } from "@/types";

export function useAgencias() {
  const supabase = createClient();
  return useQuery<Agencia[]>({
    queryKey: ["agencias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agencias")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as Agencia[];
    },
  });
}
