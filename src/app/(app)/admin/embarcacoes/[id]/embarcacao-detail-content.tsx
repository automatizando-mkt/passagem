"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePermission } from "@/hooks/use-permission";
import {
  capacidadeFormSchema,
  type CapacidadeFormData,
} from "@/features/admin/capacidade/schemas";
import {
  upsertCapacidade,
  deleteCapacidade,
} from "@/features/admin/capacidade/actions";
import type { Embarcacao, CapacidadeAcomodacao, TipoAcomodacao } from "@/types";

const TIPO_LABELS: Record<string, string> = {
  lancha: "Lancha",
  balsa: "Balsa",
  catamara: "Catamara",
  ferry: "Ferry",
};

interface EmbarcacaoDetailContentProps {
  embarcacao: Embarcacao;
  capacidades: CapacidadeAcomodacao[];
  tiposAcomodacao: TipoAcomodacao[];
}

export function EmbarcacaoDetailContent({
  embarcacao,
  capacidades,
  tiposAcomodacao,
}: EmbarcacaoDetailContentProps) {
  const { can, isLoading } = usePermission();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canWrite = !isLoading && can("create", "admin");

  const tiposMap = new Map<string, string>();
  tiposAcomodacao.forEach((t) => tiposMap.set(t.id, t.nome));

  // Tipos que ainda nao tem capacidade configurada
  const tiposDisponiveis = tiposAcomodacao.filter(
    (t) => !capacidades.some((c) => c.tipo_acomodacao_id === t.id),
  );

  const totalCapacidade = capacidades.reduce((sum, c) => sum + c.quantidade, 0);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CapacidadeFormData>({
    resolver: zodResolver(capacidadeFormSchema),
    defaultValues: {
      embarcacao_id: embarcacao.id,
      tipo_acomodacao_id: "",
      quantidade: 0,
    },
  });

  async function onSubmit(values: CapacidadeFormData) {
    setIsSubmitting(true);
    const result = await upsertCapacidade(values);
    setIsSubmitting(false);

    if (result.success) {
      toast.success("Capacidade salva");
      reset({ embarcacao_id: embarcacao.id, tipo_acomodacao_id: "", quantidade: 0 });
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  async function handleDelete(cap: CapacidadeAcomodacao) {
    const result = await deleteCapacidade(cap.id, embarcacao.id);
    if (result.success) {
      toast.success("Capacidade removida");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/embarcacoes"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">{embarcacao.nome}</h1>
          <Badge variant={embarcacao.ativa ? "default" : "secondary"}>
            {embarcacao.ativa ? "Ativa" : "Inativa"}
          </Badge>
        </div>
        <p className="mt-1 text-muted-foreground">
          {TIPO_LABELS[embarcacao.tipo] ?? embarcacao.tipo} — Capacidade total: {embarcacao.capacidade} passageiros
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Capacidade por Acomodacao
            {totalCapacidade > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({totalCapacidade} vagas configuradas)
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {capacidades.length === 0 ? (
            <p className="mb-4 text-sm text-muted-foreground">
              Nenhuma capacidade configurada.
            </p>
          ) : (
            <div className="mb-4 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo de Acomodacao</TableHead>
                    <TableHead className="text-right">Quantidade</TableHead>
                    {canWrite && <TableHead className="w-16">Acoes</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {capacidades.map((cap) => (
                    <TableRow key={cap.id}>
                      <TableCell className="font-medium">
                        {tiposMap.get(cap.tipo_acomodacao_id) ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {cap.quantidade}
                      </TableCell>
                      {canWrite && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(cap)}
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {canWrite && tiposDisponiveis.length > 0 && (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex items-end gap-3"
            >
              <input type="hidden" {...register("embarcacao_id")} />

              <div className="flex-1 space-y-1">
                <Label>Tipo</Label>
                <Controller
                  control={control}
                  name="tipo_acomodacao_id"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposDisponiveis.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.tipo_acomodacao_id && (
                  <p className="text-sm text-destructive">
                    {errors.tipo_acomodacao_id.message}
                  </p>
                )}
              </div>

              <div className="w-28 space-y-1">
                <Label>Qtd</Label>
                <Input
                  type="number"
                  placeholder="0"
                  {...register("quantidade", { valueAsNumber: true })}
                />
                {errors.quantidade && (
                  <p className="text-sm text-destructive">
                    {errors.quantidade.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
              </Button>
            </form>
          )}

          {canWrite && tiposDisponiveis.length === 0 && capacidades.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Todos os tipos de acomodacao ja foram configurados.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
