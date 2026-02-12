"use client";

import { useEffect, useState, useCallback } from "react";
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
import { usePontosParada } from "@/features/frota/hooks";
import {
  passagemFormSchema,
  type PassagemFormData,
} from "@/features/vendas/passagens/schemas";
import {
  createPassagem,
  fetchPrice,
} from "@/features/vendas/passagens/actions";
import type { Viagem, Itinerario, TipoAcomodacao, CapacidadeAcomodacao, Assento } from "@/types";
import type { AssentoOcupado } from "./page";

interface VendaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  viagem: Viagem;
  itinerario: Itinerario | null;
  tiposAcomodacao: TipoAcomodacao[];
  capacidades: CapacidadeAcomodacao[];
  assentos: Assento[];
  assentosOcupados: AssentoOcupado[];
  onSuccess: (passagemId: string) => void;
}

export function VendaDialog({
  open,
  onOpenChange,
  viagem,
  itinerario,
  tiposAcomodacao,
  capacidades,
  assentos,
  assentosOcupados,
  onSuccess,
}: VendaDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [preco, setPreco] = useState<number | null>(null);
  const [loadingPreco, setLoadingPreco] = useState(false);

  const { data: pontosParada = [] } = usePontosParada(
    viagem.itinerario_id,
  );

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm<PassagemFormData>({
    resolver: zodResolver(passagemFormSchema),
    defaultValues: {
      viagem_id: viagem.id,
      nome_passageiro: "",
      documento: "",
      data_nascimento: "",
      tipo_acomodacao_id: "",
      ponto_embarque_id: "",
      ponto_desembarque_id: "",
      assento: "",
      metodo_pagamento: undefined,
    },
  });

  const embarqueId = watch("ponto_embarque_id");
  const desembarqueId = watch("ponto_desembarque_id");
  const tipoAcomodacaoId = watch("tipo_acomodacao_id");

  useEffect(() => {
    if (open) {
      reset({
        viagem_id: viagem.id,
        nome_passageiro: "",
        documento: "",
        data_nascimento: "",
        tipo_acomodacao_id: "",
        ponto_embarque_id: "",
        ponto_desembarque_id: "",
        assento: "",
        metodo_pagamento: undefined,
      });
      setPreco(null);
    }
  }, [open, viagem.id, reset]);

  const calcularPreco = useCallback(async () => {
    if (!embarqueId || !desembarqueId || !tipoAcomodacaoId || !viagem.itinerario_id)
      return;
    if (embarqueId === desembarqueId) {
      setPreco(null);
      return;
    }
    setLoadingPreco(true);
    const result = await fetchPrice({
      itinerarioId: viagem.itinerario_id,
      pontoOrigemId: embarqueId,
      pontoDestinoId: desembarqueId,
      tipoAcomodacaoId,
    });
    setPreco(result?.preco ?? null);
    setLoadingPreco(false);
  }, [embarqueId, desembarqueId, tipoAcomodacaoId, viagem.itinerario_id]);

  useEffect(() => {
    calcularPreco();
  }, [calcularPreco]);

  async function onSubmit(values: PassagemFormData) {
    setIsSubmitting(true);
    const result = await createPassagem(values);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Passagem vendida com sucesso!");
      onSuccess(result.passagem_id);
    } else {
      toast.error(result.error);
    }
  }

  // Filter desembarque: must be after embarque in ordem
  const embarquePonto = pontosParada.find((p) => p.id === embarqueId);
  const desembarqueOptions = embarquePonto
    ? pontosParada.filter((p) => p.ordem > embarquePonto.ordem)
    : pontosParada;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nova Passagem</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {itinerario?.nome ?? "—"} — {new Date(viagem.data_saida).toLocaleDateString("pt-BR")}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input type="hidden" {...register("viagem_id")} />

          {/* Passageiro */}
          <div className="space-y-2">
            <Label htmlFor="nome_passageiro">Nome do Passageiro</Label>
            <Input
              id="nome_passageiro"
              placeholder="Nome completo"
              {...register("nome_passageiro")}
            />
            {errors.nome_passageiro && (
              <p className="text-sm text-destructive">
                {errors.nome_passageiro.message}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="documento">Documento</Label>
              <Input
                id="documento"
                placeholder="CPF ou RG"
                {...register("documento")}
              />
              {errors.documento && (
                <p className="text-sm text-destructive">
                  {errors.documento.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="data_nascimento">Data de Nascimento</Label>
              <Input
                id="data_nascimento"
                type="date"
                {...register("data_nascimento")}
              />
            </div>
          </div>

          {/* Trecho */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Embarque</Label>
              <Controller
                control={control}
                name="ponto_embarque_id"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {pontosParada.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome_local}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.ponto_embarque_id && (
                <p className="text-sm text-destructive">
                  {errors.ponto_embarque_id.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Desembarque</Label>
              <Controller
                control={control}
                name="ponto_desembarque_id"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!embarqueId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {desembarqueOptions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.nome_local}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.ponto_desembarque_id && (
                <p className="text-sm text-destructive">
                  {errors.ponto_desembarque_id.message}
                </p>
              )}
            </div>
          </div>

          {/* Acomodacao — filtered by embarcacao capacidades */}
          <div className="space-y-2">
            <Label>Acomodacao</Label>
            <Controller
              control={control}
              name="tipo_acomodacao_id"
              render={({ field }) => {
                const tiposFiltrados = capacidades.length > 0
                  ? tiposAcomodacao.filter((t) =>
                      capacidades.some((c) => c.tipo_acomodacao_id === t.id),
                    )
                  : tiposAcomodacao;
                return (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposFiltrados.map((t) => (
                        <SelectItem key={t.id} value={t.id}>
                          {t.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                );
              }}
            />
            {errors.tipo_acomodacao_id && (
              <p className="text-sm text-destructive">
                {errors.tipo_acomodacao_id.message}
              </p>
            )}
          </div>

          {/* Assento — Select when seat control active, hidden otherwise */}
          {(() => {
            const capSelecionada = capacidades.find(
              (c) => c.tipo_acomodacao_id === tipoAcomodacaoId,
            );
            const temControle = capSelecionada?.controle_assentos ?? false;

            if (!temControle || !tipoAcomodacaoId) return null;

            const assentosDaAcomodacao = assentos.filter(
              (a) => a.tipo_acomodacao_id === tipoAcomodacaoId,
            );
            const ocupados = assentosOcupados
              .filter((o) => o.tipo_acomodacao_id === tipoAcomodacaoId)
              .map((o) => o.assento);
            const disponiveis = assentosDaAcomodacao.filter(
              (a) => !ocupados.includes(a.numero),
            );

            return (
              <div className="space-y-2">
                <Label>Assento</Label>
                <Controller
                  control={control}
                  name="assento"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o assento" />
                      </SelectTrigger>
                      <SelectContent>
                        {disponiveis.map((a) => (
                          <SelectItem key={a.id} value={a.numero}>
                            Assento {a.numero}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {disponiveis.length === 0 && (
                  <p className="text-sm text-destructive">
                    Todos os assentos estao ocupados
                  </p>
                )}
              </div>
            );
          })()}

          {/* Preco */}
          <div className="rounded-md border bg-muted/50 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Valor da Passagem</span>
              {loadingPreco ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : preco !== null ? (
                <span className="text-lg font-bold text-primary">
                  R$ {preco.toFixed(2)}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">
                  Selecione trecho e acomodacao
                </span>
              )}
            </div>
            {preco === null &&
              embarqueId &&
              desembarqueId &&
              tipoAcomodacaoId &&
              !loadingPreco && (
                <p className="mt-1 text-sm text-destructive">
                  Preco nao configurado para este trecho
                </p>
              )}
          </div>

          {/* Pagamento */}
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

          <DialogFooter>
            <Button
              type="submit"
              disabled={isSubmitting || preco === null}
              className="w-full sm:w-auto"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Confirmar Venda
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
