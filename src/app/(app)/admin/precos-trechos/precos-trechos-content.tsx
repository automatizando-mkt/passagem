"use client";

import { useState, useMemo } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePermission } from "@/hooks/use-permission";
import { deletePrecoTrecho } from "@/features/admin/precos-trechos/actions";
import type { PrecoTrecho, Itinerario, PontoParada, TipoAcomodacao } from "@/types";
import { PrecoTrechoDialog } from "./preco-trecho-dialog";

interface PrecosTrechosContentProps {
  precos: PrecoTrecho[];
  itinerarios: Itinerario[];
  pontos: PontoParada[];
  tiposAcomodacao: TipoAcomodacao[];
}

export function PrecosTrechosContent({
  precos,
  itinerarios,
  pontos,
  tiposAcomodacao,
}: PrecosTrechosContentProps) {
  const { can, isLoading } = usePermission();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PrecoTrecho | null>(null);
  const [filtroItinerario, setFiltroItinerario] = useState<string>("all");

  const canWrite = !isLoading && can("create", "admin");

  const pontosMap = useMemo(() => {
    const map = new Map<string, string>();
    pontos.forEach((p) => map.set(p.id, p.nome_local));
    return map;
  }, [pontos]);

  const itinerariosMap = useMemo(() => {
    const map = new Map<string, string>();
    itinerarios.forEach((i) => map.set(i.id, i.nome));
    return map;
  }, [itinerarios]);

  const tiposMap = useMemo(() => {
    const map = new Map<string, string>();
    tiposAcomodacao.forEach((t) => map.set(t.id, t.nome));
    return map;
  }, [tiposAcomodacao]);

  const filtered =
    filtroItinerario === "all"
      ? precos
      : precos.filter((p) => p.itinerario_id === filtroItinerario);

  function handleEdit(preco: PrecoTrecho) {
    setEditing(preco);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  async function handleDelete(preco: PrecoTrecho) {
    const result = await deletePrecoTrecho(preco.id);
    if (result.success) {
      toast.success("Preco removido");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "—";
    return new Date(dateStr + "T00:00:00").toLocaleDateString("pt-BR");
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Precos por Trecho</h1>
        {canWrite && (
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Preco
          </Button>
        )}
      </div>

      <div className="mb-4">
        <Select value={filtroItinerario} onValueChange={setFiltroItinerario}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por itinerario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os itinerarios</SelectItem>
            {itinerarios.map((it) => (
              <SelectItem key={it.id} value={it.id}>
                {it.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nenhum preco cadastrado.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Itinerario</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Acomodacao</TableHead>
                <TableHead className="text-right">Preco</TableHead>
                <TableHead>Vigencia</TableHead>
                {canWrite && <TableHead className="w-28">Acoes</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((preco) => (
                <TableRow key={preco.id}>
                  <TableCell className="font-medium">
                    {itinerariosMap.get(preco.itinerario_id) ?? "—"}
                  </TableCell>
                  <TableCell>
                    {pontosMap.get(preco.ponto_origem_id) ?? "—"}
                  </TableCell>
                  <TableCell>
                    {pontosMap.get(preco.ponto_destino_id) ?? "—"}
                  </TableCell>
                  <TableCell>
                    {tiposMap.get(preco.tipo_acomodacao_id) ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(preco.preco)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(preco.vigencia_inicio)}
                    {" — "}
                    {formatDate(preco.vigencia_fim)}
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(preco)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(preco)}
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

      <PrecoTrechoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        preco={editing}
        itinerarios={itinerarios}
        pontos={pontos}
        tiposAcomodacao={tiposAcomodacao}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
