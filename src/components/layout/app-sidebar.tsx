"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Ship,
  Route,
  Calendar,
  DollarSign,
  LogOut,
  Bed,
  Tag,
  Building2,
  Layers,
  ShoppingCart,
  Ticket,
  Package,
  HandCoins,
  Receipt,
  Wallet,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { can, type Action, type Resource } from "@/lib/permissions";
import { createClient } from "@/lib/supabase";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  resource: Resource | null;
  action: Action;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Principal",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        resource: null,
        action: "read",
      },
    ],
  },
  {
    title: "Frota",
    items: [
      {
        label: "Embarcacoes",
        href: "/admin/embarcacoes",
        icon: Ship,
        resource: "embarcacoes",
        action: "read",
      },
      {
        label: "Itinerarios",
        href: "/admin/itinerarios",
        icon: Route,
        resource: "itinerarios",
        action: "read",
      },
      {
        label: "Acomodacoes",
        href: "/admin/tipos-acomodacao",
        icon: Bed,
        resource: "admin",
        action: "read",
      },
      {
        label: "Precos",
        href: "/admin/precos-trechos",
        icon: Tag,
        resource: "admin",
        action: "read",
      },
      {
        label: "Setores",
        href: "/admin/setores-embarcacao",
        icon: Layers,
        resource: "admin",
        action: "read",
      },
    ],
  },
  {
    title: "Operacoes",
    items: [
      {
        label: "Viagens",
        href: "/admin/viagens",
        icon: Calendar,
        resource: "viagens",
        action: "read",
      },
    ],
  },
  {
    title: "Vendas",
    items: [
      {
        label: "Nova Venda",
        href: "/vendas",
        icon: ShoppingCart,
        resource: "passagens",
        action: "create",
      },
      {
        label: "Passagens",
        href: "/vendas/passagens",
        icon: Ticket,
        resource: "passagens",
        action: "read",
      },
      {
        label: "Encomendas",
        href: "/vendas/encomendas",
        icon: Package,
        resource: "encomendas",
        action: "read",
      },
    ],
  },
  {
    title: "Configuracoes",
    items: [
      {
        label: "Agencias",
        href: "/admin/agencias",
        icon: Building2,
        resource: "agencias",
        action: "read",
      },
    ],
  },
  {
    title: "Financeiro",
    items: [
      {
        label: "Comissoes",
        href: "/financeiro/comissoes",
        icon: HandCoins,
        resource: "comissoes",
        action: "read",
      },
      {
        label: "Transacoes",
        href: "/financeiro/transacoes",
        icon: Receipt,
        resource: "financeiro",
        action: "read",
      },
      {
        label: "Despesas",
        href: "/financeiro/despesas",
        icon: DollarSign,
        resource: "financeiro",
        action: "read",
      },
      {
        label: "Fechamento",
        href: "/financeiro/fechamento",
        icon: Wallet,
        resource: "financeiro",
        action: "read",
      },
      {
        label: "Relatorios",
        href: "/admin/relatorios",
        icon: BarChart3,
        resource: "admin",
        action: "read",
      },
    ],
  },
];

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Admin",
  PROPRIETARIO: "Proprietario",
  TRIPULACAO: "Tripulacao",
  VENDEDOR: "Vendedor",
};

interface AppSidebarProps {
  role: UserRole;
  nome: string;
  email: string;
  onNavigate?: () => void;
}

export function AppSidebar({ role, nome, email, onNavigate }: AppSidebarProps) {
  const pathname = usePathname();

  async function handleSignOut() {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair.");
      return;
    }
    window.location.href = "/login";
  }

  const initials = nome
    ? nome
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "?";

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 py-5">
        <Ship className="h-6 w-6 text-primary" />
        <span className="text-lg font-bold">Passagem</span>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => {
          const visibleItems = section.items.filter(
            (item) =>
              item.resource === null || can(role, item.action, item.resource),
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-4">
              <p className="mb-1 px-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>
              {visibleItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={`flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      <Separator />

      {/* User info */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
            {initials}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="truncate text-sm font-medium">{nome || "Usuario"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <Badge variant="secondary" className="text-xs">
            {ROLE_LABELS[role]}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2"
            onClick={handleSignOut}
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
