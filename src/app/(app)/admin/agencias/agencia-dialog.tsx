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
  agenciaFormSchema,
  type AgenciaFormData,
} from "@/features/admin/agencias/schemas";
import {
  createAgencia,
  updateAgencia,
} from "@/features/admin/agencias/actions";
import type { Agencia } from "@/types";

interface AgenciaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  agencia: Agencia | null;
  onSuccess: () => void;
}

export function AgenciaDialog({
  open,
  onOpenChange,
  agencia,
  onSuccess,
}: AgenciaDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!agencia;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AgenciaFormData>({
    resolver: zodResolver(agenciaFormSchema),
    defaultValues: {
      nome: "",
      cnpj_cpf: "",
      percentual_comissao: 0,
      contato: "",
      endereco: "",
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        agencia
          ? {
              nome: agencia.nome,
              cnpj_cpf: agencia.cnpj_cpf ?? "",
              percentual_comissao: agencia.percentual_comissao,
              contato: agencia.contato ?? "",
              endereco: agencia.endereco ?? "",
            }
          : {
              nome: "",
              cnpj_cpf: "",
              percentual_comissao: 0,
              contato: "",
              endereco: "",
            },
      );
    }
  }, [open, agencia, reset]);

  async function onSubmit(values: AgenciaFormData) {
    setIsSubmitting(true);

    const result = isEditing
      ? await updateAgencia(agencia.id, values)
      : await createAgencia(values);

    setIsSubmitting(false);

    if (result.success) {
      toast.success(
        isEditing ? "Agencia atualizada" : "Agencia criada",
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
            {isEditing ? "Editar Agencia" : "Nova Agencia"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome</Label>
            <Input
              id="nome"
              placeholder="Nome da agencia"
              {...register("nome")}
            />
            {errors.nome && (
              <p className="text-sm text-destructive">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cnpj_cpf">CNPJ/CPF</Label>
            <Input
              id="cnpj_cpf"
              placeholder="CNPJ ou CPF"
              {...register("cnpj_cpf")}
            />
            {errors.cnpj_cpf && (
              <p className="text-sm text-destructive">
                {errors.cnpj_cpf.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="percentual_comissao">Comissao (%)</Label>
            <Input
              id="percentual_comissao"
              type="number"
              placeholder="0"
              {...register("percentual_comissao", { valueAsNumber: true })}
            />
            {errors.percentual_comissao && (
              <p className="text-sm text-destructive">
                {errors.percentual_comissao.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contato">Contato</Label>
            <Input
              id="contato"
              placeholder="Telefone ou email"
              {...register("contato")}
            />
            {errors.contato && (
              <p className="text-sm text-destructive">
                {errors.contato.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="endereco">Endereco</Label>
            <Input
              id="endereco"
              placeholder="Endereco da agencia"
              {...register("endereco")}
            />
            {errors.endereco && (
              <p className="text-sm text-destructive">
                {errors.endereco.message}
              </p>
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
