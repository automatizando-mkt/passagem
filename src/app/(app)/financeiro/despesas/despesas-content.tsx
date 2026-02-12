"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";
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
import { deleteDespesaViagem } from "@/features/financeiro/despesas/actions";
import type { DespesaViagem, Viagem, Itinerario } from "@/types";
import { DespesaDialog } from "./despesa-dialog";

const CATEGORIA_LABELS: Record<string, string> = {
  combustivel: "Combustivel",
  manutencao: "Manutencao",
  alimentacao: "Alimentacao",
  outros: "Outros",
};

const CATEGORIA_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  combustivel: "default",
  manutencao: "secondary",
  alimentacao: "outline",
  outros: "outline",
};

interface DespesasContentProps {
  despesas: DespesaViagem[];
  viagens: Viagem[];
  itinerarios: Itinerario[];
}

export function DespesasContent({
  despesas,
  viagens,
  itinerarios,
}: DespesasContentProps) {
  const { can, isLoading } = usePermission();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<DespesaViagem | null>(null);
  const [filterViagem, setFilterViagem] = useState("all");

  const canWrite = !isLoading && can("create", "financeiro");

  const viagemMap = useMemo(
    () => new Map(viagens.map((v) => [v.id, v])),
    [viagens],
  );
  const itinerarioMap = useMemo(
    () => new Map(itinerarios.map((i) => [i.id, i.nome])),
    [itinerarios],
  );

  function viagemLabel(viagemId: string) {
    const v = viagemMap.get(viagemId);
    if (!v) return "—";
    const itin = itinerarioMap.get(v.itinerario_id) ?? "";
    const date = new Date(v.data_saida).toLocaleDateString("pt-BR");
    return `${itin} — ${date}`;
  }

  const filtered = useMemo(() => {
    if (filterViagem === "all") return despesas;
    return despesas.filter((d) => d.viagem_id === filterViagem);
  }, [despesas, filterViagem]);

  const totalDespesas = useMemo(
    () => filtered.reduce((sum, d) => sum + d.valor, 0),
    [filtered],
  );

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  function handleEdit(d: DespesaViagem) {
    setEditing(d);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    const result = await deleteDespesaViagem(id);
    if (result.success) {
      toast.success("Despesa removida");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  // Viagens que tem despesas
  const viagensComDespesa = useMemo(() => {
    const ids = new Set(despesas.map((d) => d.viagem_id));
    return viagens.filter((v) => ids.has(v.id));
  }, [despesas, viagens]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Despesas de Viagem</h1>
          <p className="text-sm text-muted-foreground">
            Total: R$ {totalDespesas.toFixed(2)}
          </p>
        </div>
        {canWrite && (
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>
        )}
      </div>

      <div className="mb-4">
        <Select value={filterViagem} onValueChange={setFilterViagem}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por viagem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as viagens</SelectItem>
            {viagensComDespesa.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {viagemLabel(v.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma despesa registrada.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Viagem</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data</TableHead>
                {canWrite && <TableHead className="w-24">Acoes</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="text-sm">
                    {viagemLabel(d.viagem_id)}
                  </TableCell>
                  <TableCell>{d.descricao}</TableCell>
                  <TableCell>
                    <Badge variant={CATEGORIA_VARIANTS[d.categoria] ?? "outline"}>
                      {CATEGORIA_LABELS[d.categoria] ?? d.categoria}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {d.valor.toFixed(2)}
                  </TableCell>
                  <TableCell>{formatDate(d.created_at)}</TableCell>
                  {canWrite && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(d)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(d.id)}
                          title="Excluir"
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

      <DespesaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        despesa={editing}
        viagens={viagens}
        itinerarios={itinerarios}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
