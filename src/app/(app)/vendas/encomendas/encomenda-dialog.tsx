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
  encomendaFormSchema,
  type EncomendaFormData,
} from "@/features/vendas/encomendas/schemas";
import { createEncomenda } from "@/features/vendas/encomendas/actions";
import type {
  Viagem,
  Itinerario,
  Embarcacao,
  SetorEmbarcacao,
} from "@/types";

interface EncomendaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagens: Viagem[];
  itinerarios: Itinerario[];
  embarcacoes: Embarcacao[];
  setores: SetorEmbarcacao[];
  onSuccess: () => void;
}

export function EncomendaDialog({
  open,
  onOpenChange,
  viagens,
  itinerarios,
  embarcacoes,
  setores,
  onSuccess,
}: EncomendaDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itinerarioMap = useMemo(
    () => new Map(itinerarios.map((i) => [i.id, i.nome])),
    [itinerarios],
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<EncomendaFormData>({
    resolver: zodResolver(encomendaFormSchema),
    defaultValues: {
      viagem_id: "",
      remetente: "",
      destinatario: "",
      descricao: "",
      peso_kg: "",
      setor_id: "",
      valor: undefined as unknown as number,
      metodo_pagamento: undefined,
    },
  });

  const selectedViagemId = watch("viagem_id");

  // Get embarcacao_id from selected viagem to filter setores
  const selectedViagem = useMemo(
    () => viagens.find((v) => v.id === selectedViagemId),
    [viagens, selectedViagemId],
  );

  const filteredSetores = useMemo(() => {
    if (!selectedViagem) return setores;
    return setores.filter((s) => s.embarcacao_id === selectedViagem.embarcacao_id);
  }, [setores, selectedViagem]);

  useEffect(() => {
    if (open) {
      reset({
        viagem_id: "",
        remetente: "",
        destinatario: "",
        descricao: "",
        peso_kg: "",
        setor_id: "",
        valor: undefined as unknown as number,
        metodo_pagamento: undefined,
      });
    }
  }, [open, reset]);

  function viagemLabel(v: Viagem) {
    const itin = itinerarioMap.get(v.itinerario_id) ?? "";
    const date = new Date(v.data_saida).toLocaleDateString("pt-BR");
    return `${itin} \u2014 ${date}`;
  }

  async function onSubmit(values: EncomendaFormData) {
    setIsSubmitting(true);
    const result = await createEncomenda(values);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Encomenda registrada com sucesso!");
      onSuccess();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Encomenda</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Viagem */}
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

          {/* Remetente */}
          <div className="space-y-2">
            <Label htmlFor="remetente">Remetente</Label>
            <Input
              id="remetente"
              placeholder="Nome do remetente"
              {...register("remetente")}
            />
            {errors.remetente && (
              <p className="text-sm text-destructive">
                {errors.remetente.message}
              </p>
            )}
          </div>

          {/* Destinatario */}
          <div className="space-y-2">
            <Label htmlFor="destinatario">Destinatario</Label>
            <Input
              id="destinatario"
              placeholder="Nome do destinatario"
              {...register("destinatario")}
            />
            {errors.destinatario && (
              <p className="text-sm text-destructive">
                {errors.destinatario.message}
              </p>
            )}
          </div>

          {/* Descricao */}
          <div className="space-y-2">
            <Label htmlFor="descricao">Descricao</Label>
            <Input
              id="descricao"
              placeholder="Descricao do pacote/encomenda"
              {...register("descricao")}
            />
            {errors.descricao && (
              <p className="text-sm text-destructive">
                {errors.descricao.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Peso */}
            <div className="space-y-2">
              <Label htmlFor="peso_kg">Peso em kg (opcional)</Label>
              <Input
                id="peso_kg"
                type="number"
                step="0.01"
                min="0"
                placeholder="Ex: 5.5"
                {...register("peso_kg")}
              />
            </div>

            {/* Setor */}
            <div className="space-y-2">
              <Label>Setor (opcional)</Label>
              <Controller
                control={control}
                name="setor_id"
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(val) =>
                      field.onChange(val === "none" ? "" : val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {filteredSetores.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* Valor */}
            <div className="space-y-2">
              <Label htmlFor="valor">Valor (R$)</Label>
              <Input
                id="valor"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register("valor", { valueAsNumber: true })}
              />
              {errors.valor && (
                <p className="text-sm text-destructive">
                  {errors.valor.message}
                </p>
              )}
            </div>

            {/* Metodo de Pagamento */}
            <div className="space-y-2">
              <Label>Metodo de Pagamento</Label>
              <Controller
                control={control}
                name="metodo_pagamento"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="cartao">Cartao</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.metodo_pagamento && (
                <p className="text-sm text-destructive">
                  {errors.metodo_pagamento.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Registrar Encomenda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
