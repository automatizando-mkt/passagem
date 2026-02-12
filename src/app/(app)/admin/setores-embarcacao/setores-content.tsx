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
import { deleteSetorEmbarcacao } from "@/features/admin/setores-embarcacao/actions";
import type { SetorEmbarcacao, Embarcacao } from "@/types";
import { SetorDialog } from "./setor-dialog";

interface SetoresContentProps {
  setores: SetorEmbarcacao[];
  embarcacoes: Embarcacao[];
}

export function SetoresContent({ setores, embarcacoes }: SetoresContentProps) {
  const { can, isLoading } = usePermission();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SetorEmbarcacao | null>(null);
  const [selectedEmbarcacao, setSelectedEmbarcacao] = useState<string>("all");

  const canWrite = !isLoading && can("create", "admin");

  const embarcacoesMap = useMemo(() => {
    const map = new Map<string, string>();
    embarcacoes.forEach((e) => map.set(e.id, e.nome));
    return map;
  }, [embarcacoes]);

  const filtered =
    selectedEmbarcacao === "all"
      ? setores
      : setores.filter((s) => s.embarcacao_id === selectedEmbarcacao);

  function handleEdit(setor: SetorEmbarcacao) {
    setEditing(setor);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  async function handleDelete(setor: SetorEmbarcacao) {
    const result = await deleteSetorEmbarcacao(setor.id);
    if (result.success) {
      toast.success("Setor removido");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Setores de Embarcacao</h1>
        {canWrite && (
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Setor
          </Button>
        )}
      </div>

      <div className="mb-4">
        <Select value={selectedEmbarcacao} onValueChange={setSelectedEmbarcacao}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por embarcacao" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as embarcacoes</SelectItem>
            {embarcacoes.map((emb) => (
              <SelectItem key={emb.id} value={emb.id}>
                {emb.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nenhum setor cadastrado.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Embarcacao</TableHead>
                <TableHead>Descricao</TableHead>
                {canWrite && <TableHead className="w-28">Acoes</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((setor) => (
                <TableRow key={setor.id}>
                  <TableCell className="font-medium">{setor.nome}</TableCell>
                  <TableCell>
                    {embarcacoesMap.get(setor.embarcacao_id) ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {setor.descricao || "—"}
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(setor)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(setor)}
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

      <SetorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        setor={editing}
        embarcacoes={embarcacoes}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
