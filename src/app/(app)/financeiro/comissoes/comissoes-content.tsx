"use client";

import { useMemo } from "react";
import { HandCoins } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Comissao } from "@/types";

interface ComissaoComDetalhes extends Comissao {
  vendedor_nome?: string;
  passageiro_nome?: string;
}

interface ComissoesContentProps {
  comissoes: ComissaoComDetalhes[];
}

export function ComissoesContent({ comissoes }: ComissoesContentProps) {
  const totalComissoes = useMemo(
    () => comissoes.reduce((sum, c) => sum + c.valor, 0),
    [comissoes],
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
        <h1 className="text-2xl font-bold">Comissoes</h1>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Comissoes
            </CardTitle>
            <HandCoins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {totalComissoes.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {comissoes.length} registro(s)
            </p>
          </CardContent>
        </Card>
      </div>

      {comissoes.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma comissao registrada.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Passageiro</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Percentual</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {comissoes.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.vendedor_nome}
                  </TableCell>
                  <TableCell>{c.passageiro_nome}</TableCell>
                  <TableCell>R$ {c.valor.toFixed(2)}</TableCell>
                  <TableCell>{c.percentual}%</TableCell>
                  <TableCell>{formatDate(c.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
