"use client";

import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RelatorioRow {
  viagem_id: string;
  itinerario_nome: string;
  data_saida: string;
  embarcacao_nome: string;
  total_passagens: number;
  total_encomendas: number;
  receita_passagens: number;
  receita_fretes: number;
  total_despesas: number;
}

interface RelatoriosContentProps {
  relatorio: RelatorioRow[];
}

export function RelatoriosContent({ relatorio }: RelatoriosContentProps) {
  const totais = useMemo(() => {
    return relatorio.reduce(
      (acc, r) => ({
        passagens: acc.passagens + r.total_passagens,
        encomendas: acc.encomendas + r.total_encomendas,
        receita: acc.receita + r.receita_passagens + r.receita_fretes,
        despesas: acc.despesas + r.total_despesas,
      }),
      { passagens: 0, encomendas: 0, receita: 0, despesas: 0 },
    );
  }, [relatorio]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Relatorios</h1>
        <p className="text-muted-foreground">
          Relatorio consolidado por viagem
        </p>
      </div>

      {/* Totais */}
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Passagens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totais.passagens}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Encomendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totais.encomendas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totais.receita.toFixed(2)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Despesas Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totais.despesas.toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      {relatorio.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma viagem encontrada.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Itinerario</TableHead>
                <TableHead>Embarcacao</TableHead>
                <TableHead className="text-right">Passag.</TableHead>
                <TableHead className="text-right">Encom.</TableHead>
                <TableHead className="text-right">Receita Pass.</TableHead>
                <TableHead className="text-right">Receita Frete</TableHead>
                <TableHead className="text-right">Despesas</TableHead>
                <TableHead className="text-right">Lucro</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {relatorio.map((r) => {
                const lucro =
                  r.receita_passagens + r.receita_fretes - r.total_despesas;
                return (
                  <TableRow key={r.viagem_id}>
                    <TableCell>{formatDate(r.data_saida)}</TableCell>
                    <TableCell>{r.itinerario_nome}</TableCell>
                    <TableCell>{r.embarcacao_nome}</TableCell>
                    <TableCell className="text-right">
                      {r.total_passagens}
                    </TableCell>
                    <TableCell className="text-right">
                      {r.total_encomendas}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {r.receita_passagens.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {r.receita_fretes.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      R$ {r.total_despesas.toFixed(2)}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${lucro >= 0 ? "text-green-600" : "text-red-600"}`}
                    >
                      R$ {lucro.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
