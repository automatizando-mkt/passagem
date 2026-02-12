"use client";

import { Printer, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Encomenda, Viagem } from "@/types";

interface ReciboContentProps {
  encomenda: Encomenda;
  viagem: Viagem | null;
  itinerarioNome: string;
}

export function ReciboContent({
  encomenda,
  viagem,
  itinerarioNome,
}: ReciboContentProps) {
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

      {/* Recibo imprimivel */}
      <div className="mx-auto max-w-md rounded-md border p-6 print:border-none print:p-0">
        <div className="mb-4 text-center">
          <h1 className="text-lg font-bold">RECIBO DE FRETE</h1>
          <p className="text-xs text-muted-foreground">
            Passagem - Sistema de Transporte
          </p>
        </div>

        <Separator className="mb-4" />

        <div className="mb-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Data:</span>
            <span>{formatDate(encomenda.created_at)}</span>
          </div>
          {viagem && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Viagem:</span>
              <span>
                {itinerarioNome} —{" "}
                {new Date(viagem.data_saida).toLocaleDateString("pt-BR")}
              </span>
            </div>
          )}
        </div>

        <Separator className="mb-4" />

        <div className="mb-4 space-y-2 text-sm">
          <p>
            <strong>Remetente:</strong> {encomenda.remetente}
          </p>
          <p>
            <strong>Destinatario:</strong> {encomenda.destinatario}
          </p>
        </div>

        <Separator className="mb-4" />

        <div className="mb-4 space-y-2 text-sm">
          <p>
            <strong>Descricao:</strong> {encomenda.descricao}
          </p>
          {encomenda.peso_kg && (
            <p>
              <strong>Peso:</strong> {encomenda.peso_kg.toFixed(1)} kg
            </p>
          )}
        </div>

        <Separator className="mb-4" />

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Valor do Frete:</span>
          <span className="text-xl font-bold">
            R$ {encomenda.valor.toFixed(2)}
          </span>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs text-muted-foreground">
          <div>
            <div className="mb-1 border-t border-muted-foreground" />
            Remetente
          </div>
          <div>
            <div className="mb-1 border-t border-muted-foreground" />
            Responsavel
          </div>
        </div>
      </div>
    </div>
  );
}
