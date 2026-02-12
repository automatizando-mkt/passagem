"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase";
import type { Transacao } from "@/types";

export function useTransacoes() {
  const supabase = createClient();
  return useQuery<Transacao[]>({
    queryKey: ["transacoes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transacoes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Transacao[];
    },
  });
}
