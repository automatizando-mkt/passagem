import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import type { UserRole } from "@/types";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  let profile = (
    await supabase
      .from("profiles")
      .select("role, nome")
      .eq("user_id", user.id)
      .single<{ role: UserRole; nome: string }>()
  ).data;

  if (!profile) {
    const nome =
      user.user_metadata?.nome ??
      user.email?.split("@")[0] ??
      "Usuario";
    const { data: newProfile } = await supabase
      .from("profiles")
      .insert({ user_id: user.id, nome, role: "VENDEDOR" as const })
      .select("role, nome")
      .single<{ role: UserRole; nome: string }>();

    if (!newProfile) {
      await supabase.auth.signOut();
      redirect("/login?error=profile");
    }
    profile = newProfile;
  }

  const userInfo = {
    email: user.email ?? "",
    role: profile.role,
    nome: profile.nome ?? "",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-card md:block">
        <AppSidebar {...userInfo} />
      </aside>

      {/* Main content */}
      <div className="md:pl-64">
        <AppHeader {...userInfo} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
