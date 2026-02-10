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
import { toggleEmbarcacao } from "@/features/frota/actions";
import type { Embarcacao } from "@/types";
import { EmbarcacaoDialog } from "./embarcacao-dialog";

const TIPO_LABELS: Record<string, string> = {
  lancha: "Lancha",
  balsa: "Balsa",
  catamara: "Catamara",
  ferry: "Ferry",
};

interface EmbarcacoesContentProps {
  embarcacoes: Embarcacao[];
}

export function EmbarcacoesContent({ embarcacoes }: EmbarcacoesContentProps) {
  const { can, isLoading } = usePermission();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Embarcacao | null>(null);

  const canWrite = !isLoading && can("create", "embarcacoes");

  function handleEdit(embarcacao: Embarcacao) {
    setEditing(embarcacao);
    setDialogOpen(true);
  }

  function handleNew() {
    setEditing(null);
    setDialogOpen(true);
  }

  async function handleToggle(embarcacao: Embarcacao) {
    const result = await toggleEmbarcacao(embarcacao.id, !embarcacao.ativa);
    if (result.success) {
      toast.success(
        embarcacao.ativa ? "Embarcacao desativada" : "Embarcacao ativada",
      );
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Embarcacoes</h1>
        {canWrite && (
          <Button onClick={handleNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Embarcacao
          </Button>
        )}
      </div>

      {embarcacoes.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma embarcacao cadastrada.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Capacidade</TableHead>
                <TableHead>Status</TableHead>
                {canWrite && <TableHead className="w-28">Acoes</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {embarcacoes.map((emb) => (
                <TableRow key={emb.id}>
                  <TableCell className="font-medium">{emb.nome}</TableCell>
                  <TableCell>{TIPO_LABELS[emb.tipo] ?? emb.tipo}</TableCell>
                  <TableCell className="text-right">
                    {emb.capacidade}
                  </TableCell>
                  <TableCell>
                    <Badge variant={emb.ativa ? "default" : "secondary"}>
                      {emb.ativa ? "Ativa" : "Inativa"}
                    </Badge>
                  </TableCell>
                  {canWrite && (
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(emb)}
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleToggle(emb)}
                          title={emb.ativa ? "Desativar" : "Ativar"}
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

      <EmbarcacaoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        embarcacao={editing}
        onSuccess={() => {
          setDialogOpen(false);
          router.refresh();
        }}
      />
    </div>
  );
}
