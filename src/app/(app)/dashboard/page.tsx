import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import type { UserRole } from "@/types";
import { DashboardContent } from "./dashboard-content";

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, nome")
    .eq("user_id", user.id)
    .single<{ role: UserRole; nome: string }>();

  return (
    <DashboardContent
      email={user.email ?? ""}
      role={profile?.role ?? "VENDEDOR"}
      nome={profile?.nome ?? ""}
    />
  );
}
