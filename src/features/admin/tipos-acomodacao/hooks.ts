"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { TipoAcomodacao } from "@/types";

export function useTiposAcomodacao() {
  const supabase = createClient();
  return useQuery<TipoAcomodacao[]>({
    queryKey: ["tipos_acomodacao"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tipos_acomodacao")
        .select("*")
        .order("nome");
      if (error) throw error;
      return data as TipoAcomodacao[];
    },
  });
}
