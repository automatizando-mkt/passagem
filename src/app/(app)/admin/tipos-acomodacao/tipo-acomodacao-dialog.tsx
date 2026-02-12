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
  tipoAcomodacaoFormSchema,
  type TipoAcomodacaoFormData,
} from "@/features/admin/tipos-acomodacao/schemas";
import {
  createTipoAcomodacao,
  updateTipoAcomodacao,
} from "@/features/admin/tipos-acomodacao/actions";
import type { TipoAcomodacao } from "@/types";

interface TipoAcomodacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: TipoAcomodacao | null;
  onSuccess: () => void;
}

export function TipoAcomodacaoDialog({
  open,
  onOpenChange,
  tipo,
  onSuccess,
}: TipoAcomodacaoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!tipo;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TipoAcomodacaoFormData>({
    resolver: zodResolver(tipoAcomodacaoFormSchema),
    defaultValues: { nome: "", descricao: "" },
  });

  useEffect(() => {
    if (open) {
      reset(
        tipo
          ? { nome: tipo.nome, descricao: tipo.descricao ?? "" }
          : { nome: "", descricao: "" },
      );
    }
  }, [open, tipo, reset]);

  async function onSubmit(values: TipoAcomodacaoFormData) {
    setIsSubmitting(true);

    const result = isEditing
      ? await updateTipoAcomodacao(tipo.id, values)
      : await createTipoAcomodacao(values);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(isEditing ? "Tipo atualizado" : "Tipo criado");
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
            {isEditing ? "Editar Tipo de Acomodacao" : "Novo Tipo de Acomodacao"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              placeholder="Ex: Rede, Cabine, Leito"
              {...register("nome")}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
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
