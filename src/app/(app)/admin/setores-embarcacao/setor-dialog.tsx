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
  setorEmbarcacaoFormSchema,
  type SetorEmbarcacaoFormData,
} from "@/features/admin/setores-embarcacao/schemas";
import {
  createSetorEmbarcacao,
  updateSetorEmbarcacao,
} from "@/features/admin/setores-embarcacao/actions";
import type { SetorEmbarcacao, Embarcacao } from "@/types";

interface SetorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setor: SetorEmbarcacao | null;
  embarcacoes: Embarcacao[];
  onSuccess: () => void;
}

export function SetorDialog({
  open,
  onOpenChange,
  setor,
  embarcacoes,
  onSuccess,
}: SetorDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!setor;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<SetorEmbarcacaoFormData>({
    resolver: zodResolver(setorEmbarcacaoFormSchema),
    defaultValues: { embarcacao_id: "", nome: "", descricao: "" },
  });

  useEffect(() => {
    if (open) {
      reset(
        setor
          ? {
              embarcacao_id: setor.embarcacao_id,
              nome: setor.nome,
              descricao: setor.descricao ?? "",
            }
          : { embarcacao_id: "", nome: "", descricao: "" },
      );
    }
  }, [open, setor, reset]);

  async function onSubmit(values: SetorEmbarcacaoFormData) {
    setIsSubmitting(true);

    const result = isEditing
      ? await updateSetorEmbarcacao(setor.id, values)
      : await createSetorEmbarcacao(values);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(isEditing ? "Setor atualizado" : "Setor criado");
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
            {isEditing ? "Editar Setor" : "Novo Setor"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Embarcacao</Label>
            <Controller
              control={control}
              name="embarcacao_id"
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a embarcacao" />
                  </SelectTrigger>
                  <SelectContent>
                    {embarcacoes.map((emb) => (
                      <SelectItem key={emb.id} value={emb.id}>
                        {emb.nome}
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
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              placeholder="Nome do setor"
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
