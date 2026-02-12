"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, Calendar, Ship, MapPin, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Viagem,
  Embarcacao,
  Itinerario,
  TipoAcomodacao,
  CapacidadeAcomodacao,
} from "@/types";
import type { OcupacaoRecord } from "./page";
import { VendaDialog } from "./venda-dialog";

interface VagasInfo {
  tipo_acomodacao_id: string;
  tipo_nome: string;
  capacidade: number;
  ocupadas: number;
}

interface VendasContentProps {
  viagens: Viagem[];
  embarcacoes: Embarcacao[];
  itinerarios: Itinerario[];
  tiposAcomodacao: TipoAcomodacao[];
  capacidades: CapacidadeAcomodacao[];
  ocupacao: OcupacaoRecord[];
}

export function VendasContent({
  viagens,
  embarcacoes,
  itinerarios,
  tiposAcomodacao,
  capacidades,
  ocupacao,
}: VendasContentProps) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedViagem, setSelectedViagem] = useState<Viagem | null>(null);
  const [filtroOrigem, setFiltroOrigem] = useState("none");
  const [filtroDestino, setFiltroDestino] = useState("none");

  const embarcacaoMap = new Map(embarcacoes.map((e) => [e.id, e.nome]));
  const itinerarioMap = new Map(itinerarios.map((i) => [i.id, i]));
  const tipoAcomodacaoMap = new Map(tiposAcomodacao.map((t) => [t.id, t.nome]));

  // Build unique origin/destination lists from itinerarios
  const origensUnicas = useMemo(() => {
    const set = new Set<string>();
    for (const i of itinerarios) {
      if (i.origem) set.add(i.origem);
    }
    return Array.from(set).sort();
  }, [itinerarios]);

  const destinosUnicos = useMemo(() => {
    const set = new Set<string>();
    for (const i of itinerarios) {
      if (i.destino) set.add(i.destino);
    }
    return Array.from(set).sort();
  }, [itinerarios]);

  // Filter viagens based on selected origin/destination
  const viagensFiltradas = useMemo(() => {
    return viagens.filter((v) => {
      const itin = itinerarioMap.get(v.itinerario_id);
      if (!itin) return false;

      if (filtroOrigem !== "none" && itin.origem !== filtroOrigem) return false;
      if (filtroDestino !== "none" && itin.destino !== filtroDestino)
        return false;

      return true;
    });
  }, [viagens, filtroOrigem, filtroDestino, itinerarioMap]);

  // Build vagas info for a given viagem
  function getVagasInfo(viagem: Viagem): VagasInfo[] {
    const caps = capacidades.filter(
      (c) => c.embarcacao_id === viagem.embarcacao_id,
    );

    return caps.map((cap) => {
      const ocupRecord = ocupacao.find(
        (o) =>
          o.viagem_id === viagem.id &&
          o.tipo_acomodacao_id === cap.tipo_acomodacao_id,
      );

      return {
        tipo_acomodacao_id: cap.tipo_acomodacao_id,
        tipo_nome: tipoAcomodacaoMap.get(cap.tipo_acomodacao_id) ?? "—",
        capacidade: cap.quantidade,
        ocupadas: ocupRecord?.count ?? 0,
      };
    });
  }

  function getVagaBadgeVariant(
    info: VagasInfo,
  ): "default" | "secondary" | "destructive" | "outline" {
    const disponivel = info.capacidade - info.ocupadas;
    const percentOcupado =
      info.capacidade > 0 ? info.ocupadas / info.capacidade : 1;

    if (disponivel <= 0) return "destructive";
    if (percentOcupado >= 0.8) return "outline";
    return "secondary";
  }

  function handleVender(viagem: Viagem) {
    setSelectedViagem(viagem);
    setDialogOpen(true);
  }

  function handleLimparFiltros() {
    setFiltroOrigem("none");
    setFiltroDestino("none");
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  const hasFilters = filtroOrigem !== "none" || filtroDestino !== "none";

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Nova Venda de Passagem</h1>
        <p className="text-muted-foreground">
          Selecione uma viagem disponivel para iniciar a venda.
        </p>
      </div>

      {/* Filter Section */}
      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg border p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Filter className="h-4 w-4" />
          Filtros
        </div>
        <div className="flex flex-1 flex-wrap items-end gap-4">
          <div className="w-48">
            <label className="mb-1 block text-sm font-medium">Origem</label>
            <Select value={filtroOrigem} onValueChange={setFiltroOrigem}>
              <SelectTrigger>
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todas</SelectItem>
                {origensUnicas.map((origem) => (
                  <SelectItem key={origem} value={origem}>
                    {origem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-48">
            <label className="mb-1 block text-sm font-medium">Destino</label>
            <Select value={filtroDestino} onValueChange={setFiltroDestino}>
              <SelectTrigger>
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Todos</SelectItem>
                {destinosUnicos.map((destino) => (
                  <SelectItem key={destino} value={destino}>
                    {destino}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={handleLimparFiltros}>
              Limpar filtros
            </Button>
          )}
        </div>
      </div>

      {viagensFiltradas.length === 0 ? (
        <p className="text-muted-foreground">
          {hasFilters
            ? "Nenhuma viagem encontrada com os filtros selecionados."
            : "Nenhuma viagem disponivel para venda no momento."}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {viagensFiltradas.map((v) => {
            const itin = itinerarioMap.get(v.itinerario_id);
            const vagasInfo = getVagasInfo(v);
            return (
              <Card key={v.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base">
                      {itin?.nome ?? "—"}
                    </CardTitle>
                    <Badge
                      variant={
                        v.status === "embarque" ? "default" : "outline"
                      }
                    >
                      {v.status === "embarque" ? "Embarque" : "Programada"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDate(v.data_saida)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Ship className="h-4 w-4" />
                    {embarcacaoMap.get(v.embarcacao_id) ?? "—"}
                  </div>
                  {itin?.descricao && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{itin.descricao}</span>
                    </div>
                  )}
                  {/* Capacity display */}
                  {vagasInfo.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {vagasInfo.map((info) => (
                        <Badge
                          key={info.tipo_acomodacao_id}
                          variant={getVagaBadgeVariant(info)}
                          className="text-xs"
                        >
                          {info.tipo_nome}: {info.ocupadas}/{info.capacidade}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button className="w-full" onClick={() => handleVender(v)}>
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Vender Passagem
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {selectedViagem && (
        <VendaDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          viagem={selectedViagem}
          itinerario={itinerarioMap.get(selectedViagem.itinerario_id) ?? null}
          tiposAcomodacao={tiposAcomodacao}
          onSuccess={() => {
            setDialogOpen(false);
            router.refresh();
          }}
        />
      )}
    </div>
  );
}
