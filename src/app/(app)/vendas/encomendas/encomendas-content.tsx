"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Package, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { updateEncomendaStatus } from "@/features/vendas/encomendas/actions";
import { EncomendaDialog } from "./encomenda-dialog";
import type {
  Encomenda,
  Viagem,
  Itinerario,
  Embarcacao,
  SetorEmbarcacao,
  StatusEncomenda,
} from "@/types";

const STATUS_LABELS: Record<StatusEncomenda, string> = {
  recebida: "Recebida",
  em_transito: "Em Transito",
  entregue: "Entregue",
  devolvida: "Devolvida",
};

const STATUS_VARIANTS: Record<
  StatusEncomenda,
  "default" | "secondary" | "destructive" | "outline"
> = {
  recebida: "outline",
  em_transito: "default",
  entregue: "secondary",
  devolvida: "destructive",
};

interface EncomendasContentProps {
  encomendas: Encomenda[];
  viagens: Viagem[];
  itinerarios: Itinerario[];
  embarcacoes: Embarcacao[];
  setores: SetorEmbarcacao[];
}

export function EncomendasContent({
  encomendas,
  viagens,
  itinerarios,
  embarcacoes,
  setores,
}: EncomendasContentProps) {
  const { can, isLoading } = usePermission();
  const router = useRouter();
  const [filterViagem, setFilterViagem] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const canCreate = !isLoading && can("create", "encomendas");
  const canUpdate = !isLoading && can("update", "encomendas");

  const viagemMap = useMemo(
    () => new Map(viagens.map((v) => [v.id, v])),
    [viagens],
  );
  const itinerarioMap = useMemo(
    () => new Map(itinerarios.map((i) => [i.id, i.nome])),
    [itinerarios],
  );
  const setorMap = useMemo(
    () => new Map(setores.map((s) => [s.id, s.nome])),
    [setores],
  );

  const filtered = useMemo(() => {
    let result = encomendas;
    if (filterViagem !== "all") {
      result = result.filter((e) => e.viagem_id === filterViagem);
    }
    if (filterStatus !== "all") {
      result = result.filter((e) => e.status === filterStatus);
    }
    return result;
  }, [encomendas, filterViagem, filterStatus]);

  function viagemLabel(viagemId: string) {
    const v = viagemMap.get(viagemId);
    if (!v) return "\u2014";
    const itin = itinerarioMap.get(v.itinerario_id) ?? "";
    const date = new Date(v.data_saida).toLocaleDateString("pt-BR");
    return `${itin} \u2014 ${date}`;
  }

  // Viagens que tem encomendas (for filter dropdown)
  const viagensComEncomenda = useMemo(() => {
    const ids = new Set(encomendas.map((e) => e.viagem_id));
    return viagens.filter((v) => ids.has(v.id));
  }, [encomendas, viagens]);

  // Viagens disponiveis para nova encomenda (programada/embarque)
  const viagensDisponiveis = useMemo(
    () => viagens.filter((v) => v.status === "programada" || v.status === "embarque"),
    [viagens],
  );

  async function handleStatusChange(id: string, newStatus: StatusEncomenda) {
    const result = await updateEncomendaStatus(id, newStatus);
    if (result.success) {
      toast.success(`Status atualizado para ${STATUS_LABELS[newStatus]}`);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function handleDialogSuccess() {
    setDialogOpen(false);
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Package className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Encomendas / Fretes</h1>
        </div>
        {canCreate && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Encomenda
          </Button>
        )}
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={filterViagem} onValueChange={setFilterViagem}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por viagem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as viagens</SelectItem>
            {viagensComEncomenda.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {viagemLabel(v.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma encomenda encontrada.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Remetente</TableHead>
                <TableHead>Destinatario</TableHead>
                <TableHead>Viagem</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead>Peso</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-32">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium">{e.remetente}</TableCell>
                  <TableCell>{e.destinatario}</TableCell>
                  <TableCell className="text-sm">
                    {viagemLabel(e.viagem_id)}
                  </TableCell>
                  <TableCell className="text-sm max-w-48 truncate">
                    {e.descricao}
                  </TableCell>
                  <TableCell className="text-sm">
                    {e.peso_kg !== null ? `${e.peso_kg} kg` : "\u2014"}
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {e.valor.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[e.status]}>
                      {STATUS_LABELS[e.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {canUpdate && (
                        <Select
                          value={e.status}
                          onValueChange={(value) =>
                            handleStatusChange(e.id, value as StatusEncomenda)
                          }
                        >
                          <SelectTrigger className="h-8 w-8 p-0 [&>svg]:hidden">
                            <Pencil className="h-4 w-4 mx-auto" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <EncomendaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        viagens={viagensDisponiveis}
        itinerarios={itinerarios}
        embarcacoes={embarcacoes}
        setores={setores}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
}
