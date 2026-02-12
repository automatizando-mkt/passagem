"use client";

import { useState, useMemo } from "react";
import { Receipt, CreditCard, Banknote, Smartphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Transacao, TipoTransacao, MetodoPagamento } from "@/types";

const TIPO_LABELS: Record<TipoTransacao, string> = {
  passagem: "Passagem",
  frete: "Frete",
  despesa: "Despesa",
};

const TIPO_VARIANTS: Record<
  TipoTransacao,
  "default" | "secondary" | "destructive" | "outline"
> = {
  passagem: "default",
  frete: "secondary",
  despesa: "destructive",
};

const METODO_LABELS: Record<MetodoPagamento, string> = {
  pix: "PIX",
  cartao: "Cartao",
  dinheiro: "Dinheiro",
};

const METODO_ICONS: Record<MetodoPagamento, React.ComponentType<{ className?: string }>> = {
  pix: Smartphone,
  cartao: CreditCard,
  dinheiro: Banknote,
};

interface TransacoesContentProps {
  transacoes: Transacao[];
}

export function TransacoesContent({ transacoes }: TransacoesContentProps) {
  const [filterTipo, setFilterTipo] = useState("all");
  const [filterMetodo, setFilterMetodo] = useState("all");

  const filtered = useMemo(() => {
    let result = transacoes;
    if (filterTipo !== "all") {
      result = result.filter((t) => t.tipo === filterTipo);
    }
    if (filterMetodo !== "all") {
      result = result.filter((t) => t.metodo_pagamento === filterMetodo);
    }
    return result;
  }, [transacoes, filterTipo, filterMetodo]);

  const totaisPorMetodo = useMemo(() => {
    const totais: Record<string, number> = { pix: 0, cartao: 0, dinheiro: 0 };
    for (const t of filtered) {
      totais[t.metodo_pagamento] = (totais[t.metodo_pagamento] ?? 0) + t.valor;
    }
    return totais;
  }, [filtered]);

  const totalGeral = useMemo(
    () => filtered.reduce((sum, t) => sum + t.valor, 0),
    [filtered],
  );

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Transacoes</h1>
      </div>

      {/* Totais */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalGeral.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {filtered.length} transacao(oes)
            </p>
          </CardContent>
        </Card>
        {(["pix", "cartao", "dinheiro"] as MetodoPagamento[]).map((metodo) => {
          const Icon = METODO_ICONS[metodo];
          return (
            <Card key={metodo}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {METODO_LABELS[metodo]}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {(totaisPorMetodo[metodo] ?? 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={filterTipo} onValueChange={setFilterTipo}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {Object.entries(TIPO_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterMetodo} onValueChange={setFilterMetodo}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Metodo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os metodos</SelectItem>
            {Object.entries(METODO_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma transacao encontrada.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Metodo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <Badge variant={TIPO_VARIANTS[t.tipo]}>
                      {TIPO_LABELS[t.tipo]}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {t.valor.toFixed(2)}
                  </TableCell>
                  <TableCell>{METODO_LABELS[t.metodo_pagamento]}</TableCell>
                  <TableCell>{formatDate(t.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
