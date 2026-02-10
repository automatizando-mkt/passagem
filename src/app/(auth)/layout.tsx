import { redirect } from "next/navigation";
import { Ship } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 px-4">
      <div className="mb-8 flex items-center gap-2">
        <Ship className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">Passagem</span>
      </div>
      {children}
    </div>
  );
}
