"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { usePermission } from "@/hooks/use-permission";
import {
  pontoParadaFormSchema,
  type PontoParadaFormData,
} from "@/features/frota/schemas";
import {
  createPontoParada,
  updatePontoParada,
  deletePontoParada,
  reorderPontoParada,
} from "@/features/frota/actions";
import type { Itinerario, PontoParada } from "@/types";

interface Props {
  itinerario: Itinerario;
  pontos: PontoParada[];
}

export function ItinerarioDetailContent({ itinerario, pontos }: Props) {
  const { can, isLoading: permLoading } = usePermission();
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPonto, setEditingPonto] = useState<PontoParada | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reordering, setReordering] = useState<string | null>(null);

  const canWrite = !permLoading && can("update", "itinerarios");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PontoParadaFormData>({
    resolver: zodResolver(pontoParadaFormSchema),
    defaultValues: { nome_local: "", duracao_parada_min: 0 },
  });

  function handleNewPonto() {
    setEditingPonto(null);
    reset({ nome_local: "", duracao_parada_min: 0 });
    setDialogOpen(true);
  }

  function handleEditPonto(ponto: PontoParada) {
    setEditingPonto(ponto);
    reset({
      nome_local: ponto.nome_local,
      duracao_parada_min: ponto.duracao_parada_min,
    });
    setDialogOpen(true);
  }

  async function onSubmitPonto(values: PontoParadaFormData) {
    setIsSubmitting(true);

    const result = editingPonto
      ? await updatePontoParada(editingPonto.id, itinerario.id, values)
      : await createPontoParada(itinerario.id, values);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(editingPonto ? "Ponto atualizado" : "Ponto adicionado");
      setDialogOpen(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDeletePonto(ponto: PontoParada) {
    const result = await deletePontoParada(ponto.id, itinerario.id);
    if (result.success) {
      toast.success("Ponto removido");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleReorder(pontoId: string, direction: "up" | "down") {
    setReordering(pontoId);
    const result = await reorderPontoParada(
      itinerario.id,
      pontoId,
      direction,
    );
    setReordering(null);

    if (result.success) {
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" className="mb-2" asChild>
          <Link href="/admin/itinerarios">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{itinerario.nome}</h1>
          <Badge variant={itinerario.ativo ? "default" : "secondary"}>
            {itinerario.ativo ? "Ativo" : "Inativo"}
          </Badge>
        </div>
        {itinerario.descricao && (
          <p className="mt-1 text-muted-foreground">{itinerario.descricao}</p>
        )}
      </div>

      {/* Pontos de Parada */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Pontos de Parada ({pontos.length})
            </CardTitle>
            {canWrite && (
              <Button size="sm" onClick={handleNewPonto}>
                <Plus className="mr-1 h-4 w-4" />
                Adicionar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pontos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum ponto de parada cadastrado.
            </p>
          ) : (
            <div className="space-y-2">
              {pontos.map((ponto, idx) => (
                <div
                  key={ponto.id}
                  className="flex items-center gap-3 rounded-md border p-3"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {ponto.ordem}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{ponto.nome_local}</p>
                    {ponto.duracao_parada_min > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Parada: {ponto.duracao_parada_min} min
                      </p>
                    )}
                  </div>
                  {canWrite && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={idx === 0 || reordering === ponto.id}
                        onClick={() => handleReorder(ponto.id, "up")}
                        title="Mover para cima"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={
                          idx === pontos.length - 1 ||
                          reordering === ponto.id
                        }
                        onClick={() => handleReorder(ponto.id, "down")}
                        title="Mover para baixo"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleEditPonto(ponto)}
                        title="Editar"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => handleDeletePonto(ponto)}
                        title="Remover"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para criar/editar ponto */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingPonto ? "Editar Ponto" : "Novo Ponto de Parada"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmitPonto)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome_local">Nome do Local</Label>
              <Input
                id="nome_local"
                placeholder="Ex: Porto de Manaus"
                {...register("nome_local")}
              />
              {errors.nome_local && (
                <p className="text-sm text-destructive">
                  {errors.nome_local.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracao_parada_min">
                Duracao da Parada (minutos)
              </Label>
              <Input
                id="duracao_parada_min"
                type="number"
                placeholder="0"
                {...register("duracao_parada_min", { valueAsNumber: true })}
              />
              {errors.duracao_parada_min && (
                <p className="text-sm text-destructive">
                  {errors.duracao_parada_min.message}
                </p>
              )}
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editingPonto ? "Salvar" : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
