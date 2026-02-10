import { redirect } from "next/navigation";
import Link from "next/link";
import { Ship } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase-server";

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se logado, vai direto pro dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="flex items-center gap-3">
        <Ship className="h-10 w-10 text-primary" />
        <h1 className="text-4xl font-bold tracking-tight">Passagem</h1>
      </div>

      <p className="max-w-md text-center text-muted-foreground">
        Sistema de controle e venda de passagens de barco online.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comprar Passagem</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Busque viagens disponiveis e compre sua passagem.
            </p>
            <Button className="w-full" asChild>
              <Link href="/login">Entrar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Criar Conta</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-sm text-muted-foreground">
              Cadastre-se para comprar passagens online.
            </p>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/signup">Cadastrar</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
