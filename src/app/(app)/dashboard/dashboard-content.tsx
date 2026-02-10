"use client";

import { User } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/types";

interface DashboardContentProps {
  email: string;
  role: UserRole;
  nome: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  PROPRIETARIO: "Proprietario",
  TRIPULACAO: "Tripulacao",
  VENDEDOR: "Vendedor",
};

export function DashboardContent({ email, role, nome }: DashboardContentProps) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {nome || "Usuario"}
          </CardTitle>
          <CardDescription>{email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Papel:</span>
            <Badge variant="secondary">{ROLE_LABELS[role]}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Voce esta autenticado e seu perfil foi carregado do servidor.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
