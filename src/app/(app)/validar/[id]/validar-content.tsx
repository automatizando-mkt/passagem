"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updatePassagemStatus } from "@/features/vendas/passagens/actions";
import type { Passagem, StatusPassagem } from "@/types";

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

interface ValidarContentProps {
  passagem: Passagem;
  viagemInfo: string;
}

export function ValidarContent({ passagem, viagemInfo }: ValidarContentProps) {
  const router = useRouter();
  const [isValidating, setIsValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  async function handleValidar() {
    setIsValidating(true);
    const result = await updatePassagemStatus(passagem.id, "utilizada");
    setIsValidating(false);

    if (result.success) {
      setValidated(true);
      toast.success("Embarque validado com sucesso!");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  const isConfirmada = passagem.status === "confirmada";
  const isUtilizada = passagem.status === "utilizada" || validated;
  const isCanceladaOuReembolsada =
    passagem.status === "cancelada" || passagem.status === "reembolsada";

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Validacao de Embarque</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Info do passageiro */}
          <div>
            <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
              Passageiro
            </h3>
            <p className="font-medium">{passagem.nome_passageiro}</p>
            <p className="text-sm text-muted-foreground">
              Documento: {passagem.documento}
            </p>
          </div>

          {/* Info da viagem */}
          <div>
            <h3 className="mb-1 text-sm font-semibold text-muted-foreground">
              Viagem
            </h3>
            <p className="font-medium">{viagemInfo}</p>
          </div>

          {/* Status */}
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-muted-foreground">Status:</span>
            <Badge variant={STATUS_VARIANTS[validated ? "utilizada" : passagem.status]}>
              {STATUS_LABELS[validated ? "utilizada" : passagem.status]}
            </Badge>
          </div>

          {/* Acao conforme status */}
          {isConfirmada && !validated && (
            <div className="text-center">
              <Button
                size="lg"
                className="w-full"
                onClick={handleValidar}
                disabled={isValidating}
              >
                <CheckCircle className="mr-2 h-5 w-5" />
                {isValidating ? "Validando..." : "Validar Embarque"}
              </Button>
            </div>
          )}

          {isUtilizada && (
            <div className="rounded-md border border-yellow-300 bg-yellow-50 p-4 text-center dark:border-yellow-700 dark:bg-yellow-950">
              <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <p className="font-medium text-yellow-800 dark:text-yellow-200">
                Passagem ja utilizada
              </p>
              <p className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                Este bilhete ja foi validado anteriormente.
              </p>
            </div>
          )}

          {isCanceladaOuReembolsada && (
            <div className="rounded-md border border-red-300 bg-red-50 p-4 text-center dark:border-red-700 dark:bg-red-950">
              <XCircle className="mx-auto mb-2 h-8 w-8 text-red-600 dark:text-red-400" />
              <p className="font-medium text-red-800 dark:text-red-200">
                Passagem {passagem.status === "cancelada" ? "cancelada" : "reembolsada"}
              </p>
              <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                Este bilhete nao e valido para embarque.
              </p>
            </div>
          )}

          {passagem.status === "reservada" && (
            <div className="rounded-md border border-blue-300 bg-blue-50 p-4 text-center dark:border-blue-700 dark:bg-blue-950">
              <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-blue-600 dark:text-blue-400" />
              <p className="font-medium text-blue-800 dark:text-blue-200">
                Passagem reservada
              </p>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                A passagem precisa ser confirmada antes do embarque.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
