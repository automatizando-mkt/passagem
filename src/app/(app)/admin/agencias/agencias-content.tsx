"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Power } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePermission } from "@/hooks/use-permission";
import { toggleAgencia } from "@/features/admin/agencias/actions";
import type { Agencia } from "@/types";
import { AgenciaDialog } from "./agencia-dialog";

interface AgenciasContentProps {
  agencias: Agencia[];
}

export function AgenciasContent({ agencias }: AgenciasContentProps) {
  const { can, isLoading } = usePermission();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Agencia | null>(null);

  const canWrite = !isLoading && can("create", "agencias");

  function handleEdit(agencia: Agencia) {
    setEditing(agencia);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  async function handleToggle(agencia: Agencia) {
    const result = await toggleAgencia(agencia.id, !agencia.ativa);
    if (result.success) {
      toast.success(
        agencia.ativa ? "Agencia desativada" : "Agencia ativada",
      );
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Agencias</h1>
        {canWrite && (
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Agencia
          </Button>
        )}
      </div>

      {agencias.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma agencia cadastrada.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>CNPJ/CPF</TableHead>
                <TableHead className="text-right">Comissao %</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Status</TableHead>
                {canWrite && <TableHead className="w-28">Acoes</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {agencias.map((ag) => (
                <TableRow key={ag.id}>
                  <TableCell className="font-medium">{ag.nome}</TableCell>
                  <TableCell>{ag.cnpj_cpf ?? "-"}</TableCell>
                  <TableCell className="text-right">
                    {ag.percentual_comissao}%
                  </TableCell>
                  <TableCell>{ag.contato ?? "-"}</TableCell>
                  <TableCell>
                    <Badge variant={ag.ativa ? "default" : "secondary"}>
                      {ag.ativa ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(ag)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggle(ag)}
                          title={ag.ativa ? "Desativar" : "Ativar"}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AgenciaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        agencia={editing}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
