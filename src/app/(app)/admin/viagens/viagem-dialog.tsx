"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  viagemFormSchema,
  type ViagemFormData,
} from "@/features/viagens/schemas";
import { createViagem, updateViagem } from "@/features/viagens/actions";
import type { Viagem, Embarcacao, Itinerario } from "@/types";

interface ViagemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagem: Viagem | null;
  embarcacoes: Embarcacao[];
  itinerarios: Itinerario[];
  onSuccess: () => void;
}

export function ViagemDialog({
  open,
  onOpenChange,
  viagem,
  embarcacoes,
  itinerarios,
  onSuccess,
}: ViagemDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!viagem;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ViagemFormData>({
    resolver: zodResolver(viagemFormSchema),
    defaultValues: {
      itinerario_id: "",
      embarcacao_id: "",
      data_saida: "",
      observacoes: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        viagem
          ? {
              itinerario_id: viagem.itinerario_id,
              embarcacao_id: viagem.embarcacao_id,
              data_saida: viagem.data_saida.slice(0, 16),
              observacoes: viagem.observacoes ?? "",
            }
          : {
              itinerario_id: "",
              embarcacao_id: "",
              data_saida: "",
              observacoes: "",
            },
      );
    }
  }, [open, viagem, reset]);

  async function onSubmit(values: ViagemFormData) {
    setIsSubmitting(true);

    const result = isEditing
      ? await updateViagem(viagem.id, values)
      : await createViagem(values);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(isEditing ? "Viagem atualizada" : "Viagem criada");
      onSuccess();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Viagem" : "Nova Viagem"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div className="space-y-2">
            <Label>Embarcacao</Label>
            <Controller
              control={control}
              name="embarcacao_id"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a embarcacao" />
                  </SelectTrigger>
                  <SelectContent>
                    {embarcacoes.map((emb) => (
                      <SelectItem key={emb.id} value={emb.id}>
                        {emb.nome} ({emb.capacidade} passageiros)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.embarcacao_id && (
              <p className="text-sm text-destructive">
                {errors.embarcacao_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="data_saida">Data e Hora de Saida</Label>
            <Input
              id="data_saida"
              type="datetime-local"
              {...register("data_saida")}
            />
            {errors.data_saida && (
              <p className="text-sm text-destructive">
                {errors.data_saida.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observacoes</Label>
            <Textarea
              id="observacoes"
              placeholder="Observacoes opcionais"
              {...register("observacoes")}
            />
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
