"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Pencil, Power, Eye } from "lucide-react";
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
import { toggleItinerario } from "@/features/frota/actions";
import { ItinerarioDialog } from "./itinerario-dialog";

interface ItinerarioRow {
  id: string;
  nome: string;
  descricao: string | null;
  origem: string | null;
  destino: string | null;
  ativo: boolean;
  pontosCount: number;
}

interface ItinerariosContentProps {
  itinerarios: ItinerarioRow[];
}

export function ItinerariosContent({ itinerarios }: ItinerariosContentProps) {
  const { can, isLoading } = usePermission();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ItinerarioRow | null>(null);

  const canWrite = !isLoading && can("create", "itinerarios");

  function handleEdit(itinerario: ItinerarioRow) {
    setEditing(itinerario);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  async function handleToggle(itinerario: ItinerarioRow) {
    const result = await toggleItinerario(itinerario.id, !itinerario.ativo);
    if (result.success) {
      toast.success(
        itinerario.ativo ? "Itinerario desativado" : "Itinerario ativado",
      );
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Itinerarios</h1>
        {canWrite && (
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Itinerario
          </Button>
        )}
      </div>

      {itinerarios.length === 0 ? (
        <p className="text-muted-foreground">Nenhum itinerario cadastrado.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead className="text-center">Paradas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-36">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itinerarios.map((it) => (
                <TableRow key={it.id}>
                  <TableCell className="font-medium">{it.nome}</TableCell>
                  <TableCell>{it.origem || "—"}</TableCell>
                  <TableCell>{it.destino || "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {it.descricao || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    {it.pontosCount}
                  </TableCell>
                  <TableCell>
                    <Badge variant={it.ativo ? "default" : "secondary"}>
                      {it.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                      >
                        <Link
                          href={`/admin/itinerarios/${it.id}`}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {canWrite && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleEdit(it)}
                            title="Editar"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggle(it)}
                            title={it.ativo ? "Desativar" : "Ativar"}
                          >
                            <Power className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ItinerarioDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        itinerario={editing}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
