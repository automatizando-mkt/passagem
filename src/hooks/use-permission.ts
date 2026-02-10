"use client";

import { useEffect, useState } from "react";
import type { UserRole } from "@/types";
import { createClient } from "@/lib/supabase";
import { can as canCheck, type Action, type Resource } from "@/lib/permissions";

export function usePermission() {
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function fetchRole() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setRole(null);
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .single<{ role: string }>();

      setRole((data?.role as UserRole) ?? null);
      setIsLoading(false);
    }

    fetchRole();
  }, []);

  function can(action: Action, resource: Resource): boolean {
    if (!role) return false;
    return canCheck(role, action, resource);
  }

  return { role, can, isLoading };
}
