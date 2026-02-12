"use client";

import Image from "next/image";
import Link from "next/link";
import { Printer, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Passagem, Viagem, StatusPassagem } from "@/types";

const STATUS_LABELS: Record<StatusPassagem, string> = {
  reservada: "Reservada",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  utilizada: "Utilizada",
  reembolsada: "Reembolsada",
};

const STATUS_VARIANTS: Record<
  StatusPassagem,
  "default" | "secondary" | "destructive" | "outline"
> = {
  reservada: "outline",
  confirmada: "default",
  cancelada: "destructive",
  utilizada: "secondary",
  reembolsada: "destructive",
};

interface BilheteContentProps {
  passagem: Passagem;
  viagem: Viagem;
  itinerarioNome: string;
  embarcacaoNome: string;
  tipoAcomodacaoNome: string;
  embarqueNome: string;
  desembarqueNome: string;
  qrCodeUrl: string;
}

export function BilheteContent({
  passagem,
  viagem,
  itinerarioNome,
  embarcacaoNome,
  tipoAcomodacaoNome,
  embarqueNome,
  desembarqueNome,
  qrCodeUrl,
}: BilheteContentProps) {
  const dataSaida = new Date(viagem.data_saida).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const dataNascimento = passagem.data_nascimento
    ? new Date(passagem.data_nascimento).toLocaleDateString("pt-BR")
    : null;

  return (
    <div>
      {/* Acoes — ocultas na impressao */}
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/vendas/passagens">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="mr-1 h-4 w-4" />
          Imprimir
        </Button>
      </div>

      {/* Bilhete */}
      <Card className="mx-auto max-w-lg print:border-black print:shadow-none">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">
            Passagem - Bilhete Eletronico
          </CardTitle>
          <div className="flex justify-center pt-2">
            <Badge variant={STATUS_VARIANTS[passagem.status]}>
              {STATUS_LABELS[passagem.status]}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* QR Code */}
          <div className="flex justify-center">
            <Image
              src={qrCodeUrl}
              alt="QR Code do bilhete"
              width={200}
              height={200}
              className="rounded"
              unoptimized
            />
          </div>

          <Separator />

          {/* Passageiro */}
          <div>
            <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
              Passageiro
            </h3>
            <p className="font-medium">{passagem.nome_passageiro}</p>
            <p className="text-sm text-muted-foreground">
              Documento: {passagem.documento}
            </p>
            {dataNascimento && (
              <p className="text-sm text-muted-foreground">
                Nascimento: {dataNascimento}
              </p>
            )}
          </div>

          <Separator />

          {/* Viagem */}
          <div>
            <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
              Viagem
            </h3>
            <p className="font-medium">{itinerarioNome}</p>
            <p className="text-sm text-muted-foreground">
              Saida: {dataSaida}
            </p>
            <p className="text-sm text-muted-foreground">
              Embarcacao: {embarcacaoNome}
            </p>
          </div>

          <Separator />

          {/* Trecho */}
          <div>
            <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
              Trecho
            </h3>
            <p className="font-medium">
              {embarqueNome} &rarr; {desembarqueNome}
            </p>
          </div>

          <Separator />

          {/* Acomodacao */}
          <div>
            <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
              Acomodacao
            </h3>
            <p className="font-medium">{tipoAcomodacaoNome}</p>
            {passagem.assento && (
              <p className="text-sm text-muted-foreground">
                Assento: {passagem.assento}
              </p>
            )}
          </div>

          <Separator />

          {/* Valor */}
          <div className="text-center">
            <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
              Valor
            </h3>
            <p className="text-2xl font-bold">
              R$ {passagem.valor_pago.toFixed(2)}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
