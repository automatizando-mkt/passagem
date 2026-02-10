"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermission } from "@/hooks/use-permission";
import { updateViagemStatus } from "@/features/viagens/actions";
import type { Viagem, Embarcacao, Itinerario, StatusViagem } from "@/types";
import { ViagemDialog } from "./viagem-dialog";

const STATUS_LABELS: Record<StatusViagem, string> = {
  programada: "Programada",
  embarque: "Embarque",
  em_viagem: "Em Viagem",
  concluida: "Concluida",
  cancelada: "Cancelada",
};

const STATUS_VARIANTS: Record<StatusViagem, "default" | "secondary" | "destructive" | "outline"> = {
  programada: "outline",
  embarque: "default",
  em_viagem: "default",
  concluida: "secondary",
  cancelada: "destructive",
};

interface ViagensContentProps {
  viagens: Viagem[];
  embarcacoes: Embarcacao[];
  itinerarios: Itinerario[];
}

export function ViagensContent({
  viagens,
  embarcacoes,
  itinerarios,
}: ViagensContentProps) {
  const { can, isLoading } = usePermission();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Viagem | null>(null);

  const canWrite = !isLoading && can("create", "viagens");

  const embarcacaoMap = new Map(embarcacoes.map((e) => [e.id, e.nome]));
  const itinerarioMap = new Map(itinerarios.map((i) => [i.id, i.nome]));

  function handleEdit(viagem: Viagem) {
    setEditing(viagem);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  async function handleStatusChange(viagemId: string, status: StatusViagem) {
    const result = await updateViagemStatus(viagemId, status);
    if (result.success) {
      toast.success("Status atualizado");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Viagens</h1>
        {canWrite && (
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Viagem
          </Button>
        )}
      </div>

      {viagens.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma viagem cadastrada.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Saida</TableHead>
                <TableHead>Itinerario</TableHead>
                <TableHead>Embarcacao</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Obs.</TableHead>
                {canWrite && <TableHead className="w-28">Acoes</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {viagens.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="font-medium">
                    {formatDate(v.data_saida)}
                  </TableCell>
                  <TableCell>
                    {itinerarioMap.get(v.itinerario_id) ?? "—"}
                  </TableCell>
                  <TableCell>
                    {embarcacaoMap.get(v.embarcacao_id) ?? "—"}
                  </TableCell>
                  <TableCell>
                    {canWrite ? (
                      <Select
                        value={v.status}
                        onValueChange={(val) =>
                          handleStatusChange(v.id, val as StatusViagem)
                        }
                      >
                        <SelectTrigger className="h-8 w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant={STATUS_VARIANTS[v.status]}>
                        {STATUS_LABELS[v.status]}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {v.observacoes ?? "—"}
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEdit(v)}
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ViagemDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        viagem={editing}
        embarcacoes={embarcacoes}
        itinerarios={itinerarios}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
