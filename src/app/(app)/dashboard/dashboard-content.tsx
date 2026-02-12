"use client";

import {
  DollarSign,
  Ticket,
  Ship,
  Package,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import type { DashboardMetrics } from "@/features/admin/dashboard/queries";

const METODO_LABELS: Record<string, string> = {
  pix: "PIX",
  cartao: "Cartao",
  dinheiro: "Dinheiro",
};

const PIE_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444", "#8b5cf6"];

interface DashboardContentProps {
  nome: string;
  metrics: DashboardMetrics;
}

export function DashboardContent({ nome, metrics }: DashboardContentProps) {
  const receitaChartData = metrics.receitaPorDia.map((d) => ({
    date: new Date(d.date + "T12:00:00").toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    }),
    valor: d.valor,
  }));

  const metodoChartData = metrics.receitaPorMetodo.map((m) => ({
    name: METODO_LABELS[m.metodo] ?? m.metodo,
    value: m.valor,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          Ola, {nome || "Usuario"}
        </h1>
        <p className="text-muted-foreground">
          Resumo dos ultimos 30 dias
        </p>
      </div>

      {/* Metric Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics.totalReceita.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passagens</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPassagens}</div>
            <p className="text-xs text-muted-foreground">
              confirmadas/utilizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Viagens Ativas
            </CardTitle>
            <Ship className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.totalViagensAtivas}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encomendas</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEncomendas}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Receita por Dia */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Receita por Dia</CardTitle>
          </CardHeader>
          <CardContent>
            {receitaChartData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sem dados no periodo
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={receitaChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip
                    formatter={(value) => [
                      `R$ ${Number(value).toFixed(2)}`,
                      "Receita",
                    ]}
                  />
                  <Bar dataKey="valor" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Receita por Metodo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Receita por Metodo de Pagamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {metodoChartData.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sem dados no periodo
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metodoChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, value }) =>
                      `${name ?? ""}: R$ ${Number(value).toFixed(0)}`
                    }
                  >
                    {metodoChartData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip
                    formatter={(value) => [
                      `R$ ${Number(value).toFixed(2)}`,
                      "Valor",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
