"use client";

import { useEffect, useState } from "react";
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
  embarcacaoFormSchema,
  type EmbarcacaoFormData,
} from "@/features/frota/schemas";
import {
  createEmbarcacao,
  updateEmbarcacao,
} from "@/features/frota/actions";
import type { Embarcacao } from "@/types";

interface EmbarcacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embarcacao: Embarcacao | null;
  onSuccess: () => void;
}

export function EmbarcacaoDialog({
  open,
  onOpenChange,
  embarcacao,
  onSuccess,
}: EmbarcacaoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!embarcacao;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EmbarcacaoFormData>({
    resolver: zodResolver(embarcacaoFormSchema),
    defaultValues: {
      nome: "",
      capacidade: 0,
      tipo: "lancha",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        embarcacao
          ? {
              nome: embarcacao.nome,
              capacidade: embarcacao.capacidade,
              tipo: embarcacao.tipo,
            }
          : { nome: "", capacidade: 0, tipo: "lancha" },
      );
    }
  }, [open, embarcacao, reset]);

  async function onSubmit(values: EmbarcacaoFormData) {
    setIsSubmitting(true);

    const result = isEditing
      ? await updateEmbarcacao(embarcacao.id, values)
      : await createEmbarcacao(values);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(
        isEditing ? "Embarcacao atualizada" : "Embarcacao criada",
      );
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
            {isEditing ? "Editar Embarcacao" : "Nova Embarcacao"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              placeholder="Nome da embarcacao"
              {...register("nome")}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacidade">Capacidade</Label>
            <Input
              id="capacidade"
              type="number"
              placeholder="Numero de passageiros"
              {...register("capacidade", { valueAsNumber: true })}
            />
            {errors.capacidade && (
              <p className="text-sm text-destructive">
                {errors.capacidade.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Tipo</Label>
            <Controller
              control={control}
              name="tipo"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lancha">Lancha</SelectItem>
                    <SelectItem value="balsa">Balsa</SelectItem>
                    <SelectItem value="catamara">Catamara</SelectItem>
                    <SelectItem value="ferry">Ferry</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.tipo && (
              <p className="text-sm text-destructive">{errors.tipo.message}</p>
            )}
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
