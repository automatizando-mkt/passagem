"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePermission } from "@/hooks/use-permission";
import { deleteTipoAcomodacao } from "@/features/admin/tipos-acomodacao/actions";
import type { TipoAcomodacao } from "@/types";
import { TipoAcomodacaoDialog } from "./tipo-acomodacao-dialog";

interface TiposAcomodacaoContentProps {
  tipos: TipoAcomodacao[];
}

export function TiposAcomodacaoContent({ tipos }: TiposAcomodacaoContentProps) {
  const { can, isLoading } = usePermission();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<TipoAcomodacao | null>(null);

  const canWrite = !isLoading && can("create", "admin");

  function handleEdit(tipo: TipoAcomodacao) {
    setEditing(tipo);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  async function handleDelete(tipo: TipoAcomodacao) {
    const result = await deleteTipoAcomodacao(tipo.id);
    if (result.success) {
      toast.success("Tipo de acomodacao removido");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tipos de Acomodacao</h1>
        {canWrite && (
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Tipo
          </Button>
        )}
      </div>

      {tipos.length === 0 ? (
        <p className="text-muted-foreground">Nenhum tipo cadastrado.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descricao</TableHead>
                {canWrite && <TableHead className="w-28">Acoes</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tipos.map((tipo) => (
                <TableRow key={tipo.id}>
                  <TableCell className="font-medium">{tipo.nome}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {tipo.descricao || "—"}
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(tipo)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(tipo)}
                          title="Remover"
                        >
                          <Trash2 className="h-4 w-4" />
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

      <TipoAcomodacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tipo={editing}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
