import type { UserRole } from "@/types";

export type Action = "create" | "read" | "update" | "delete";
export type Resource =
  | "viagens"
  | "passagens"
  | "embarcacoes"
  | "itinerarios"
  | "encomendas"
  | "financeiro"
  | "admin";

// Nota: Isso e apenas UX. A seguranca real e no RLS do banco.
export const PERMISSION_MAP: Record<UserRole, Record<Resource, Action[]>> = {
  SUPER_ADMIN: {
    viagens: ["create", "read", "update", "delete"],
    passagens: ["create", "read", "update", "delete"],
    embarcacoes: ["create", "read", "update", "delete"],
    itinerarios: ["create", "read", "update", "delete"],
    encomendas: ["create", "read", "update", "delete"],
    financeiro: ["create", "read", "update", "delete"],
    admin: ["create", "read", "update", "delete"],
  },
  PROPRIETARIO: {
    viagens: ["create", "read", "update"],
    passagens: ["read", "update"],
    embarcacoes: ["create", "read", "update"],
    itinerarios: ["create", "read", "update"],
    encomendas: ["read", "update"],
    financeiro: ["create", "read", "update"],
    admin: ["read"],
  },
  TRIPULACAO: {
    viagens: ["read"],
    passagens: ["read"],
    embarcacoes: ["read"],
    itinerarios: ["read"],
    encomendas: ["read"],
    financeiro: [],
    admin: [],
  },
  VENDEDOR: {
    viagens: ["read"],
    passagens: ["create", "read", "update"],
    embarcacoes: ["read"],
    itinerarios: ["read"],
    encomendas: ["create", "read", "update"],
    financeiro: [],
    admin: [],
  },
};

export function can(role: UserRole, action: Action, resource: Resource): boolean {
  const allowed = PERMISSION_MAP[role]?.[resource] ?? [];
  return allowed.includes(action);
}
