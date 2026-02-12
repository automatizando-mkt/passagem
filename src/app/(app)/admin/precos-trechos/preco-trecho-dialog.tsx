"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  precoTrechoFormSchema,
  type PrecoTrechoFormData,
} from "@/features/admin/precos-trechos/schemas";
import {
  createPrecoTrecho,
  updatePrecoTrecho,
} from "@/features/admin/precos-trechos/actions";
import type { PrecoTrecho, Itinerario, PontoParada, TipoAcomodacao } from "@/types";

interface PrecoTrechoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preco: PrecoTrecho | null;
  itinerarios: Itinerario[];
  pontos: PontoParada[];
  tiposAcomodacao: TipoAcomodacao[];
  onSuccess: () => void;
}

const defaultValues: PrecoTrechoFormData = {
  itinerario_id: "",
  ponto_origem_id: "",
  ponto_destino_id: "",
  tipo_acomodacao_id: "",
  preco: 0,
  vigencia_inicio: new Date().toISOString().slice(0, 10),
  vigencia_fim: "",
};

export function PrecoTrechoDialog({
  open,
  onOpenChange,
  preco,
  itinerarios,
  pontos,
  tiposAcomodacao,
  onSuccess,
}: PrecoTrechoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!preco;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PrecoTrechoFormData>({
    resolver: zodResolver(precoTrechoFormSchema),
    defaultValues,
  });

  const selectedItinerarioId = watch("itinerario_id");

  // Filtrar pontos pelo itinerario selecionado
  const pontosDoItinerario = useMemo(
    () =>
      pontos
        .filter((p) => p.itinerario_id === selectedItinerarioId)
        .sort((a, b) => a.ordem - b.ordem),
    [pontos, selectedItinerarioId],
  );

  // Limpar origem/destino quando muda itinerario (so se nao estiver editando)
  useEffect(() => {
    if (!isEditing && selectedItinerarioId) {
      setValue("ponto_origem_id", "");
      setValue("ponto_destino_id", "");
    }
  }, [selectedItinerarioId, isEditing, setValue]);

  useEffect(() => {
    if (open) {
      reset(
        preco
          ? {
              itinerario_id: preco.itinerario_id,
              ponto_origem_id: preco.ponto_origem_id,
              ponto_destino_id: preco.ponto_destino_id,
              tipo_acomodacao_id: preco.tipo_acomodacao_id,
              preco: preco.preco,
              vigencia_inicio: preco.vigencia_inicio,
              vigencia_fim: preco.vigencia_fim ?? "",
            }
          : defaultValues,
      );
    }
  }, [open, preco, reset]);

  async function onSubmit(values: PrecoTrechoFormData) {
    if (values.ponto_origem_id === values.ponto_destino_id) {
      toast.error("Origem e destino devem ser diferentes");
      return;
    }

    setIsSubmitting(true);

    const result = isEditing
      ? await updatePrecoTrecho(preco.id, values)
      : await createPrecoTrecho(values);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(isEditing ? "Preco atualizado" : "Preco criado");
      onSuccess();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Preco" : "Novo Preco por Trecho"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Itinerario */}
          <div className="space-y-2">
            <Label>Itinerario</Label>
            <Controller
              control={control}
              name="itinerario_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o itinerario" />
                  </SelectTrigger>
                  <SelectContent>
                    {itinerarios.map((it) => (
                      <SelectItem key={it.id} value={it.id}>
                        {it.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.itinerario_id && (
              <p className="text-sm text-destructive">
                {errors.itinerario_id.message}
              </p>
            )}
          </div>

          {/* Origem e Destino lado a lado */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origem</Label>
              <Controller
                control={control}
                name="ponto_origem_id"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={pontosDoItinerario.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ponto de origem" />
                    </SelectTrigger>
                    <SelectContent>
                      {pontosDoItinerario.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.ordem}. {p.nome_local}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.ponto_origem_id && (
                <p className="text-sm text-destructive">
                  {errors.ponto_origem_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Destino</Label>
              <Controller
                control={control}
                name="ponto_destino_id"
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={pontosDoItinerario.length === 0}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Ponto de destino" />
                    </SelectTrigger>
                    <SelectContent>
                      {pontosDoItinerario.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.ordem}. {p.nome_local}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.ponto_destino_id && (
                <p className="text-sm text-destructive">
                  {errors.ponto_destino_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Tipo de Acomodacao */}
          <div className="space-y-2">
            <Label>Tipo de Acomodacao</Label>
            <Controller
              control={control}
              name="tipo_acomodacao_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a acomodacao" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposAcomodacao.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipo_acomodacao_id && (
              <p className="text-sm text-destructive">
                {errors.tipo_acomodacao_id.message}
              </p>
            )}
          </div>

          {/* Preco */}
          <div className="space-y-2">
            <Label htmlFor="preco">Preco (R$)</Label>
            <Input
              id="preco"
              type="number"
              step="0.01"
              placeholder="0.00"
              {...register("preco", { valueAsNumber: true })}
            />
            {errors.preco && (
              <p className="text-sm text-destructive">{errors.preco.message}</p>
            )}
          </div>

          {/* Vigencia */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vigencia_inicio">Inicio Vigencia</Label>
              <Input
                id="vigencia_inicio"
                type="date"
                {...register("vigencia_inicio")}
              />
              {errors.vigencia_inicio && (
                <p className="text-sm text-destructive">
                  {errors.vigencia_inicio.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vigencia_fim">Fim Vigencia</Label>
              <Input
                id="vigencia_fim"
                type="date"
                {...register("vigencia_fim")}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Salvar" : "Criar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
