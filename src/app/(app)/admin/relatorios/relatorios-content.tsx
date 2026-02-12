"use client";

import { useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import type { RelatorioPassageiroRow } from "@/features/admin/relatorios/queries";

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
  passageiros: RelatorioPassageiroRow[];
  embarcacoes: { id: string; nome: string }[];
  itinerarios: { id: string; nome: string }[];
}

const STATUS_LABELS: Record<string, string> = {
  reservada: "Reservada",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  utilizada: "Utilizada",
  reembolsada: "Reembolsada",
};

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  reservada: "outline",
  confirmada: "default",
  cancelada: "destructive",
  utilizada: "secondary",
  reembolsada: "destructive",
};

export function RelatoriosContent({
  relatorio,
  passageiros,
  embarcacoes,
  itinerarios,
}: RelatoriosContentProps) {
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

  // Passenger filters
  const [filtroEmbarcacao, setFiltroEmbarcacao] = useState("none");
  const [filtroItinerario, setFiltroItinerario] = useState("none");
  const [filtroStatus, setFiltroStatus] = useState("none");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  const passageirosFiltrados = useMemo(() => {
    return passageiros.filter((p) => {
      if (filtroEmbarcacao !== "none" && p.embarcacao_nome !== filtroEmbarcacao)
        return false;
      if (filtroItinerario !== "none" && p.itinerario_nome !== filtroItinerario)
        return false;
      if (filtroStatus !== "none" && p.status !== filtroStatus) return false;
      if (filtroDataInicio && p.data_saida < filtroDataInicio) return false;
      if (filtroDataFim && p.data_saida > filtroDataFim + "T23:59:59") return false;
      return true;
    });
  }, [passageiros, filtroEmbarcacao, filtroItinerario, filtroStatus, filtroDataInicio, filtroDataFim]);

  const hasPassageiroFilters =
    filtroEmbarcacao !== "none" ||
    filtroItinerario !== "none" ||
    filtroStatus !== "none" ||
    filtroDataInicio !== "" ||
    filtroDataFim !== "";

  function limparFiltrosPassageiros() {
    setFiltroEmbarcacao("none");
    setFiltroItinerario("none");
    setFiltroStatus("none");
    setFiltroDataInicio("");
    setFiltroDataFim("");
  }

  function formatDate(iso: string) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("pt-BR");
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Relatorios</h1>
      </div>

      <Tabs defaultValue="viagens">
        <TabsList className="mb-4">
          <TabsTrigger value="viagens">Por Viagem</TabsTrigger>
          <TabsTrigger value="passageiros">Passageiros</TabsTrigger>
        </TabsList>

        {/* ===== Tab: Por Viagem ===== */}
        <TabsContent value="viagens">
          <p className="mb-4 text-muted-foreground">
            Relatorio consolidado por viagem
          </p>

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
        </TabsContent>

        {/* ===== Tab: Passageiros ===== */}
        <TabsContent value="passageiros">
          <p className="mb-4 text-muted-foreground">
            Listagem de passageiros com filtros
          </p>

          {/* Filtros */}
          <div className="mb-4 flex flex-wrap items-end gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filtros
            </div>
            <div className="w-44">
              <label className="mb-1 block text-sm font-medium">Embarcacao</label>
              <Select value={filtroEmbarcacao} onValueChange={setFiltroEmbarcacao}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Todas</SelectItem>
                  {embarcacoes.map((e) => (
                    <SelectItem key={e.id} value={e.nome}>
                      {e.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-44">
              <label className="mb-1 block text-sm font-medium">Itinerario</label>
              <Select value={filtroItinerario} onValueChange={setFiltroItinerario}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Todos</SelectItem>
                  {itinerarios.map((i) => (
                    <SelectItem key={i.id} value={i.nome}>
                      {i.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-40">
              <label className="mb-1 block text-sm font-medium">Status</label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Todos</SelectItem>
                  <SelectItem value="reservada">Reservada</SelectItem>
                  <SelectItem value="confirmada">Confirmada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="utilizada">Utilizada</SelectItem>
                  <SelectItem value="reembolsada">Reembolsada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-36">
              <label className="mb-1 block text-sm font-medium">Data inicio</label>
              <Input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
              />
            </div>
            <div className="w-36">
              <label className="mb-1 block text-sm font-medium">Data fim</label>
              <Input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
              />
            </div>
            {hasPassageiroFilters && (
              <Button variant="ghost" size="sm" onClick={limparFiltrosPassageiros}>
                Limpar filtros
              </Button>
            )}
          </div>

          <p className="mb-2 text-sm text-muted-foreground">
            {passageirosFiltrados.length} passageiro(s) encontrado(s)
          </p>

          {passageirosFiltrados.length === 0 ? (
            <p className="text-muted-foreground">Nenhum passageiro encontrado.</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Passageiro</TableHead>
                    <TableHead>Documento</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Itinerario</TableHead>
                    <TableHead>Embarcacao</TableHead>
                    <TableHead>Trecho</TableHead>
                    <TableHead>Acomodacao</TableHead>
                    <TableHead>Assento</TableHead>
                    <TableHead className="text-right">Valor</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {passageirosFiltrados.map((p) => (
                    <TableRow key={p.passagem_id}>
                      <TableCell className="font-medium">
                        {p.nome_passageiro}
                      </TableCell>
                      <TableCell>{p.documento}</TableCell>
                      <TableCell>{formatDate(p.data_saida)}</TableCell>
                      <TableCell>{p.itinerario_nome}</TableCell>
                      <TableCell>{p.embarcacao_nome}</TableCell>
                      <TableCell>
                        {p.embarque} → {p.desembarque}
                      </TableCell>
                      <TableCell>{p.acomodacao}</TableCell>
                      <TableCell>{p.assento ?? "—"}</TableCell>
                      <TableCell className="text-right">
                        R$ {p.valor_pago.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_VARIANTS[p.status] ?? "outline"}>
                          {STATUS_LABELS[p.status] ?? p.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
