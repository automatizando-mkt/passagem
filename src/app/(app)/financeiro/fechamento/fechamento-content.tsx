"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Calendar, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  getFechamentoPreview,
  createFechamentoCaixa,
} from "@/features/financeiro/fechamento/actions";
import type { FechamentoCaixa } from "@/types";

interface FechamentoContentProps {
  fechamentos: FechamentoCaixa[];
  operadorMap: Record<string, string>;
}

interface Preview {
  total_vendas: number;
  total_despesas: number;
  saldo: number;
  transacoes_count: number;
}

export function FechamentoContent({
  fechamentos,
  operadorMap,
}: FechamentoContentProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [observacoes, setObservacoes] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadPreview = useCallback(async () => {
    if (!selectedDate) return;
    setLoadingPreview(true);
    const result = await getFechamentoPreview(selectedDate);
    setPreview(result);
    setLoadingPreview(false);
  }, [selectedDate]);

  async function handleSubmit() {
    setSubmitting(true);
    const result = await createFechamentoCaixa({
      data_fechamento: selectedDate,
      observacoes,
    });
    setSubmitting(false);

    if (result.success) {
      toast.success("Fechamento de caixa realizado");
      setPreview(null);
      setObservacoes("");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  function formatDate(iso: string) {
    return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Fechamento de Caixa</h1>
      </div>

      {/* Novo Fechamento */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-lg">Novo Fechamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value);
                  setPreview(null);
                }}
                className="w-48"
              />
            </div>
            <Button
              variant="outline"
              onClick={loadPreview}
              disabled={loadingPreview || !selectedDate}
            >
              {loadingPreview && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Calcular Preview
            </Button>
          </div>

          {preview && (
            <>
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Vendas
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-green-600">
                      R$ {preview.total_vendas.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Despesas
                    </CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-red-600">
                      R$ {preview.total_despesas.toFixed(2)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-xl font-bold ${preview.saldo >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      R$ {preview.saldo.toFixed(2)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {preview.transacoes_count} transacao(oes)
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <Label htmlFor="obs">Observacoes</Label>
                <Input
                  id="obs"
                  placeholder="Observacoes (opcional)"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                />
              </div>

              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Confirmar Fechamento
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Separator className="mb-6" />

      {/* Historico */}
      <h2 className="mb-4 text-lg font-semibold">Historico de Fechamentos</h2>

      {fechamentos.length === 0 ? (
        <p className="text-muted-foreground">Nenhum fechamento realizado.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Vendas</TableHead>
                <TableHead>Despesas</TableHead>
                <TableHead>Saldo</TableHead>
                <TableHead>Obs.</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fechamentos.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {formatDate(f.data_fechamento)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {operadorMap[f.operador_id] ?? "—"}
                  </TableCell>
                  <TableCell className="text-green-600">
                    R$ {f.total_vendas.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-red-600">
                    R$ {f.total_despesas.toFixed(2)}
                  </TableCell>
                  <TableCell
                    className={
                      f.saldo >= 0
                        ? "font-medium text-green-600"
                        : "font-medium text-red-600"
                    }
                  >
                    R$ {f.saldo.toFixed(2)}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {f.observacoes ?? "—"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
