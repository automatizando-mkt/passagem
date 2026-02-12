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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  despesaViagemFormSchema,
  type DespesaViagemFormData,
} from "@/features/financeiro/despesas/schemas";
import {
  createDespesaViagem,
  updateDespesaViagem,
} from "@/features/financeiro/despesas/actions";
import type { DespesaViagem, Viagem, Itinerario } from "@/types";

const CATEGORIAS = [
  { value: "combustivel", label: "Combustivel" },
  { value: "manutencao", label: "Manutencao" },
  { value: "alimentacao", label: "Alimentacao" },
  { value: "outros", label: "Outros" },
];

interface DespesaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  despesa: DespesaViagem | null;
  viagens: Viagem[];
  itinerarios: Itinerario[];
  onSuccess: () => void;
}

export function DespesaDialog({
  open,
  onOpenChange,
  despesa,
  viagens,
  itinerarios,
  onSuccess,
}: DespesaDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!despesa;

  const itinerarioMap = new Map(itinerarios.map((i) => [i.id, i.nome]));

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<DespesaViagemFormData>({
    resolver: zodResolver(despesaViagemFormSchema),
    defaultValues: {
      viagem_id: "",
      descricao: "",
      valor: 0,
      categoria: undefined,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        despesa
          ? {
              viagem_id: despesa.viagem_id,
              descricao: despesa.descricao,
              valor: despesa.valor,
              categoria: despesa.categoria as "combustivel" | "manutencao" | "alimentacao" | "outros",
            }
          : {
              viagem_id: "",
              descricao: "",
              valor: 0,
              categoria: undefined,
            },
      );
    }
  }, [open, despesa, reset]);

  function viagemLabel(v: Viagem) {
    const itin = itinerarioMap.get(v.itinerario_id) ?? "";
    const date = new Date(v.data_saida).toLocaleDateString("pt-BR");
    return `${itin} — ${date}`;
  }

  async function onSubmit(values: DespesaViagemFormData) {
    setIsSubmitting(true);
    const result = isEditing
      ? await updateDespesaViagem(despesa.id, values)
      : await createDespesaViagem(values);
    setIsSubmitting(false);

    if (result.success) {
      toast.success(isEditing ? "Despesa atualizada" : "Despesa criada");
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
            {isEditing ? "Editar Despesa" : "Nova Despesa"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Viagem</Label>
            <Controller
              control={control}
              name="viagem_id"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a viagem" />
                  </SelectTrigger>
                  <SelectContent>
                    {viagens.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {viagemLabel(v)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.viagem_id && (
              <p className="text-sm text-destructive">
                {errors.viagem_id.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descricao</Label>
            <Input
              id="descricao"
              placeholder="Ex: Combustivel para o trecho"
              {...register("descricao")}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">
                {errors.descricao.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0"
                {...register("valor", { valueAsNumber: true })}
              />
              {errors.valor && (
                <p className="text-sm text-destructive">
                  {errors.valor.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Controller
                control={control}
                name="categoria"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIAS.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoria && (
                <p className="text-sm text-destructive">
                  {errors.categoria.message}
                </p>
              )}
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
