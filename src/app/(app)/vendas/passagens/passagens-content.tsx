"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, Ban } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import { usePermission } from "@/hooks/use-permission";
import { updatePassagemStatus } from "@/features/vendas/passagens/actions";
import type {
  Passagem,
  Viagem,
  Itinerario,
  Embarcacao,
  TipoAcomodacao,
  PontoParada,
  StatusPassagem,
} from "@/types";

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

interface PassagensContentProps {
  passagens: Passagem[];
  viagens: Viagem[];
  itinerarios: Itinerario[];
  embarcacoes: Embarcacao[];
  tiposAcomodacao: TipoAcomodacao[];
  pontosParada: PontoParada[];
}

export function PassagensContent({
  passagens,
  viagens,
  itinerarios,
  embarcacoes,
  tiposAcomodacao,
  pontosParada,
}: PassagensContentProps) {
  const { can, isLoading } = usePermission();
  const router = useRouter();
  const [filterViagem, setFilterViagem] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const canManage = !isLoading && can("create", "passagens");

  const viagemMap = useMemo(
    () => new Map(viagens.map((v) => [v.id, v])),
    [viagens],
  );
  const itinerarioMap = useMemo(
    () => new Map(itinerarios.map((i) => [i.id, i.nome])),
    [itinerarios],
  );
  const embarcacaoMap = useMemo(
    () => new Map(embarcacoes.map((e) => [e.id, e.nome])),
    [embarcacoes],
  );
  const tipoMap = useMemo(
    () => new Map(tiposAcomodacao.map((t) => [t.id, t.nome])),
    [tiposAcomodacao],
  );
  const pontoMap = useMemo(
    () => new Map(pontosParada.map((p) => [p.id, p.nome_local])),
    [pontosParada],
  );

  const filtered = useMemo(() => {
    let result = passagens;
    if (filterViagem !== "all") {
      result = result.filter((p) => p.viagem_id === filterViagem);
    }
    if (filterStatus !== "all") {
      result = result.filter((p) => p.status === filterStatus);
    }
    return result;
  }, [passagens, filterViagem, filterStatus]);

  function viagemLabel(viagemId: string) {
    const v = viagemMap.get(viagemId);
    if (!v) return "—";
    const itin = itinerarioMap.get(v.itinerario_id) ?? "";
    const date = new Date(v.data_saida).toLocaleDateString("pt-BR");
    return `${itin} — ${date}`;
  }

  async function handleCancel(id: string) {
    const result = await updatePassagemStatus(id, "cancelada");
    if (result.success) {
      toast.success("Passagem cancelada");
      router.refresh();
    } else {
      toast.error(result.error);
    }
  }

  // Viagens que tem passagens (for filter dropdown)
  const viagensComPassagem = useMemo(() => {
    const ids = new Set(passagens.map((p) => p.viagem_id));
    return viagens.filter((v) => ids.has(v.id));
  }, [passagens, viagens]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Passagens</h1>
      </div>

      {/* Filtros */}
      <div className="mb-4 flex flex-wrap gap-3">
        <Select value={filterViagem} onValueChange={setFilterViagem}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filtrar por viagem" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as viagens</SelectItem>
            {viagensComPassagem.map((v) => (
              <SelectItem key={v.id} value={v.id}>
                {viagemLabel(v.id)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">Nenhuma passagem encontrada.</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Passageiro</TableHead>
                <TableHead>Viagem</TableHead>
                <TableHead>Trecho</TableHead>
                <TableHead>Acomodacao</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{p.nome_passageiro}</p>
                      <p className="text-xs text-muted-foreground">
                        {p.documento}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {viagemLabel(p.viagem_id)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {pontoMap.get(p.ponto_embarque_id) ?? "—"} →{" "}
                    {pontoMap.get(p.ponto_desembarque_id) ?? "—"}
                  </TableCell>
                  <TableCell className="text-sm">
                    {tipoMap.get(p.tipo_acomodacao_id) ?? "—"}
                  </TableCell>
                  <TableCell className="font-medium">
                    R$ {p.valor_pago.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANTS[p.status]}>
                      {STATUS_LABELS[p.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        asChild
                        title="Ver Bilhete"
                      >
                        <Link href={`/vendas/passagens/${p.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      {canManage && p.status === "confirmada" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleCancel(p.id)}
                          title="Cancelar"
                        >
                          <Ban className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
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
