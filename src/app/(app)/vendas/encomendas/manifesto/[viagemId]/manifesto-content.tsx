"use client";

import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Encomenda, Viagem, Itinerario, Embarcacao } from "@/types";

interface ManifestoContentProps {
  viagem: Viagem;
  itinerario: Itinerario | null;
  embarcacao: Embarcacao | null;
  encomendas: Encomenda[];
}

export function ManifestoContent({
  viagem,
  itinerario,
  embarcacao,
  encomendas,
}: ManifestoContentProps) {
  const totalPeso = encomendas.reduce((s, e) => s + (e.peso_kg ?? 0), 0);
  const totalValor = encomendas.reduce((s, e) => s + e.valor, 0);

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
      {/* Botoes nao-imprimiveis */}
      <div className="mb-4 flex gap-2 print:hidden">
        <Button variant="outline" asChild>
          <Link href="/vendas/encomendas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* Conteudo imprimivel */}
      <div className="mx-auto max-w-3xl rounded-md border p-6 print:border-none print:p-0">
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold">MANIFESTO DE CARGA</h1>
          <p className="text-sm text-muted-foreground">
            Passagem - Sistema de Transporte
          </p>
        </div>

        <Separator className="mb-4" />

        <div className="mb-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p>
              <strong>Itinerario:</strong> {itinerario?.nome ?? "—"}
            </p>
            <p>
              <strong>Embarcacao:</strong> {embarcacao?.nome ?? "—"}
            </p>
          </div>
          <div>
            <p>
              <strong>Data Saida:</strong> {formatDate(viagem.data_saida)}
            </p>
            <p>
              <strong>Status:</strong> {viagem.status}
            </p>
          </div>
        </div>

        <Separator className="mb-4" />

        {encomendas.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground">
            Nenhuma encomenda registrada para esta viagem.
          </p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Remetente</TableHead>
                  <TableHead>Destinatario</TableHead>
                  <TableHead>Descricao</TableHead>
                  <TableHead className="text-right">Peso (kg)</TableHead>
                  <TableHead className="text-right">Valor</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {encomendas.map((e, i) => (
                  <TableRow key={e.id}>
                    <TableCell>{i + 1}</TableCell>
                    <TableCell>{e.remetente}</TableCell>
                    <TableCell>{e.destinatario}</TableCell>
                    <TableCell>{e.descricao}</TableCell>
                    <TableCell className="text-right">
                      {e.peso_kg?.toFixed(1) ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {e.valor.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Separator className="my-4" />

            <div className="flex justify-end gap-8 text-sm font-medium">
              <p>Total Itens: {encomendas.length}</p>
              <p>Peso Total: {totalPeso.toFixed(1)} kg</p>
              <p>Valor Total: R$ {totalValor.toFixed(2)}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
