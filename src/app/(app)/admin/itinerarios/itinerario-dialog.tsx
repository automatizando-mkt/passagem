"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  itinerarioFormSchema,
  type ItinerarioFormData,
} from "@/features/frota/schemas";
import {
  createItinerario,
  updateItinerario,
} from "@/features/frota/actions";

interface ItinerarioData {
  id: string;
  nome: string;
  descricao: string | null;
  origem: string | null;
  destino: string | null;
}

interface ItinerarioDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itinerario: ItinerarioData | null;
  onSuccess: () => void;
}

export function ItinerarioDialog({
  open,
  onOpenChange,
  itinerario,
  onSuccess,
}: ItinerarioDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!itinerario;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ItinerarioFormData>({
    resolver: zodResolver(itinerarioFormSchema),
    defaultValues: { nome: "", descricao: "", origem: "", destino: "" },
  });

  useEffect(() => {
    if (open) {
      reset(
        itinerario
          ? {
              nome: itinerario.nome,
              descricao: itinerario.descricao ?? "",
              origem: itinerario.origem ?? "",
              destino: itinerario.destino ?? "",
            }
          : { nome: "", descricao: "", origem: "", destino: "" },
      );
    }
  }, [open, itinerario, reset]);

  async function onSubmit(values: ItinerarioFormData) {
    setIsSubmitting(true);

    const result = isEditing
      ? await updateItinerario(itinerario.id, values)
      : await createItinerario(values);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(
        isEditing ? "Itinerario atualizado" : "Itinerario criado",
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
            {isEditing ? "Editar Itinerario" : "Novo Itinerario"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              placeholder="Ex: Manaus — Parintins"
              {...register("nome")}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="origem">Origem</Label>
              <Input
                id="origem"
                placeholder="Ex: Manaus"
                {...register("origem")}
              />
              {errors.origem && (
                <p className="text-sm text-destructive">
                  {errors.origem.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="destino">Destino</Label>
              <Input
                id="destino"
                placeholder="Ex: Parintins"
                {...register("destino")}
              />
              {errors.destino && (
                <p className="text-sm text-destructive">
                  {errors.destino.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descricao</Label>
            <Input
              id="descricao"
              placeholder="Descricao opcional"
              {...register("descricao")}
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
