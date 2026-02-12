"use client";

import { useEffect } from "react";
import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import type { Embarcacao, TipoAcomodacao, CapacidadeAcomodacao } from "@/types";

interface EmbarcacaoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  embarcacao: Embarcacao | null;
  onSuccess: () => void;
  tiposAcomodacao: TipoAcomodacao[];
  capacidades?: CapacidadeAcomodacao[];
}

export function EmbarcacaoDialog({
  open,
  onOpenChange,
  embarcacao,
  onSuccess,
  tiposAcomodacao,
  capacidades = [],
}: EmbarcacaoDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!embarcacao;

  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EmbarcacaoFormData>({
    resolver: zodResolver(embarcacaoFormSchema),
    defaultValues: {
      nome: "",
      capacidade: 0,
      tipo: "lancha",
      controle_assentos: false,
      acomodacoes: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "acomodacoes",
  });

  const watchAcomodacoes = watch("acomodacoes");

  // Auto-calculate total capacidade from accommodations
  const totalCapacidade =
    watchAcomodacoes && watchAcomodacoes.length > 0
      ? watchAcomodacoes.reduce((sum, a) => sum + (a.quantidade || 0), 0)
      : 0;

  // Sync capacidade field when acomodacoes change
  useEffect(() => {
    if (watchAcomodacoes && watchAcomodacoes.length > 0) {
      setValue("capacidade", totalCapacidade || 1);
    }
  }, [totalCapacidade, watchAcomodacoes, setValue]);

  useEffect(() => {
    if (open) {
      if (embarcacao) {
        // Editing: load existing data with capacidades
        const acomodacoesData = capacidades.map((c) => ({
          tipo_acomodacao_id: c.tipo_acomodacao_id,
          quantidade: c.quantidade,
        }));

        reset({
          nome: embarcacao.nome,
          capacidade: embarcacao.capacidade,
          tipo: embarcacao.tipo,
          controle_assentos: embarcacao.controle_assentos,
          acomodacoes: acomodacoesData,
        });
      } else {
        reset({
          nome: "",
          capacidade: 0,
          tipo: "lancha",
          controle_assentos: false,
          acomodacoes: [],
        });
      }
    }
  }, [open, embarcacao, capacidades, reset]);

  // Tipos already used in the acomodacoes list
  function getAvailableTipos(currentIndex: number) {
    const usedIds = watchAcomodacoes
      .filter((_, i) => i !== currentIndex)
      .map((a) => a.tipo_acomodacao_id);
    return tiposAcomodacao.filter((t) => !usedIds.includes(t.id));
  }

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

  const hasAcomodacoes = fields.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Embarcacao" : "Nova Embarcacao"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Nome */}
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

          {/* Tipo */}
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

          {/* Acomodacoes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Acomodacoes</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  append({ tipo_acomodacao_id: "", quantidade: 1 })
                }
                disabled={fields.length >= tiposAcomodacao.length}
              >
                <Plus className="mr-1 h-3 w-3" />
                Adicionar
              </Button>
            </div>

            {fields.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma acomodacao adicionada. Adicione pelo menos uma para configurar a capacidade.
              </p>
            )}

            {fields.map((field, index) => {
              const availableTipos = getAvailableTipos(index);
              return (
                <div
                  key={field.id}
                  className="flex items-start gap-2"
                >
                  <div className="flex-1 space-y-1">
                    <Controller
                      control={control}
                      name={`acomodacoes.${index}.tipo_acomodacao_id`}
                      render={({ field: selectField }) => (
                        <Select
                          onValueChange={selectField.onChange}
                          value={selectField.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Tipo de acomodacao" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTipos.map((t) => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.nome}
                              </SelectItem>
                            ))}
                            {/* Also show the currently selected one if not in available */}
                            {selectField.value &&
                              !availableTipos.find(
                                (t) => t.id === selectField.value,
                              ) && (
                                <SelectItem
                                  key={selectField.value}
                                  value={selectField.value}
                                >
                                  {tiposAcomodacao.find(
                                    (t) => t.id === selectField.value,
                                  )?.nome ?? selectField.value}
                                </SelectItem>
                              )}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.acomodacoes?.[index]?.tipo_acomodacao_id && (
                      <p className="text-sm text-destructive">
                        {errors.acomodacoes[index].tipo_acomodacao_id.message}
                      </p>
                    )}
                  </div>

                  <div className="w-24 space-y-1">
                    <Input
                      type="number"
                      placeholder="Qtd"
                      min={1}
                      {...register(`acomodacoes.${index}.quantidade`, {
                        valueAsNumber: true,
                      })}
                    />
                    {errors.acomodacoes?.[index]?.quantidade && (
                      <p className="text-sm text-destructive">
                        {errors.acomodacoes[index].quantidade.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => remove(index)}
                    title="Remover acomodacao"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}

            {hasAcomodacoes && (
              <p className="text-sm text-muted-foreground">
                Capacidade total: <strong>{totalCapacidade}</strong> passageiros
              </p>
            )}
          </div>

          {/* Capacidade (only visible when no acomodacoes) */}
          {!hasAcomodacoes && (
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
          )}

          {/* Controle de assentos */}
          <div className="flex items-center gap-2">
            <Controller
              control={control}
              name="controle_assentos"
              render={({ field }) => (
                <Checkbox
                  id="controle_assentos"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
            <Label htmlFor="controle_assentos" className="cursor-pointer">
              Ativar controle de assentos?
            </Label>
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
