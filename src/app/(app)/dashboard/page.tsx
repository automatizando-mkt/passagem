import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { UserRole } from "@/types";
import { getDashboardMetrics } from "@/features/admin/dashboard/queries";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [profileRes, metrics] = await Promise.all([
    supabase
      .from("profiles")
      .select("role, nome")
      .eq("user_id", user.id)
      .single<{ role: UserRole; nome: string }>(),
    getDashboardMetrics(),
  ]);

  return (
    <DashboardContent
      nome={profileRes.data?.nome ?? ""}
      metrics={metrics}
    />
  );
}
