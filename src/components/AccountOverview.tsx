"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { getSaldos, SaldosResponse } from "@/lib/api";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Progress } from "@/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  PieChart as PieChartIcon,
  Activity,
  Target,
} from "lucide-react";

const toNum = (x: unknown) => {
  const n = parseFloat(String(x ?? ""));
  return Number.isFinite(n) ? n : 0;
};

const fmtHNL = (n: number | null | undefined) =>
  typeof n === "number" && !Number.isNaN(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "--";

const fmtETH = (n: number | null | undefined) =>
  typeof n === "number" && !Number.isNaN(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 6 })
    : "--";

export function AccountOverview() {
  const { address, isConnected } = useAccount();

  // HNL y ETH por separado para individual y grupal
  const [fiHNL, setFiHNL] = useState<number | null>(null);
  const [fiETH, setFiETH] = useState<number>(0);
  const [cgHNL, setCgHNL] = useState<number | null>(null);
  const [cgETH, setCgETH] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const totalHNL = useMemo(() => (fiHNL ?? 0) + (cgHNL ?? 0), [fiHNL, cgHNL]);
  const totalETH = useMemo(() => (fiETH || 0) + (cgETH || 0), [fiETH, cgETH]);

  useEffect(() => {
    let cancel = false;
    const run = async () => {
      if (!isConnected || !address) return;
      setLoading(true);
      setErr(null);
      try {
        const data = await getSaldos(address); // <- usa ?wallet=
        if (cancel) return;

        // Mapea campos del BE
        const _fiETH = toNum(data.balanceWalletETH);
        const _fiHNL = toNum(data.balanceWalletHNL);
        const _cgETH = toNum(data.totalComunitarioETH);
        const _cgHNL = toNum(data.totalComunitarioHNL);

        setFiETH(_fiETH);
        setFiHNL(_fiHNL);
        setCgETH(_cgETH);
        setCgHNL(_cgHNL);
      } catch (e: any) {
        if (!cancel) setErr(e?.message || "No se pudo obtener /Saldos");
      } finally {
        if (!cancel) setLoading(false);
      }
    };
    run();
    return () => {
      cancel = true;
    };
  }, [isConnected, address]);

  const renderAmount = (hnl: number | null, eth: number) => (
    <div>
      <div className="text-2xl font-bold">L {fmtHNL(hnl)}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{fmtETH(eth)} ETH</div>
    </div>
  );

  // mocks de abajo, cámbialos si ya tienes endpoints
  const progresoAhorro = 65;
  const actividades = [
    { account: "Cuenta Grupal 1", time: "hoy 10:30", amount: "+0.01", type: "deposit", status: "completado" },
    { account: "Fondo Individual", time: "ayer 16:21", amount: "-0.002", type: "withdrawal", status: "pendiente" },
  ] as const;

  return (
    <div className="space-y-9">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Saldo Total */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Cargando…</div>
            ) : (
              renderAmount(totalHNL, totalETH)
            )}
            <p className="text-xs text-muted-foreground">
              {err ? <span className="text-red-600">{err}</span> : "Actualizado con datos reales"}
            </p>
          </CardContent>
        </Card>

        {/* Fondos Individuales (balance personal) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fondos Individuales</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Cargando…</div>
            ) : (
              renderAmount(fiHNL, fiETH)
            )}
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" /> +2.1%
              </span>{" "}
              desde la última semana
            </p>
          </CardContent>
        </Card>

        {/* Cuentas Grupales (sumatoria comunitaria) */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cuentas Grupales</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-muted-foreground">Cargando…</div>
            ) : (
              renderAmount(cgHNL, cgETH)
            )}
            <p className="text-xs text-muted-foreground">
              <span className="inline-flex items-center text-red-600">
                <TrendingDown className="h-3 w-3 mr-1" /> -0.8%
              </span>{" "}
              vs. ayer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Distribución / Metas / Actividad (placeholder) */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4" />
              Distribución
            </CardTitle>
            <CardDescription>Individual vs Grupal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground mb-2">
              Individual: <b>L {fmtHNL(fiHNL)}</b> — Grupal: <b>L {fmtHNL(cgHNL)}</b>
            </div>
            <Progress value={totalETH ? (fiETH / totalETH) * 100 : 0} />
          </CardContent>
        </Card>

      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Actividad reciente
          </CardTitle>
          <CardDescription>Últimos movimientos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {actividades.map((a, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 grid place-items-center rounded-full text-xs bg-green-100 text-green-600">
                    {a.type === "deposit" ? "↓" : "↑"}
                  </div>
                  <div>
                    <p className="font-medium">{a.account}</p>
                    <p className="text-sm text-muted-foreground">{a.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium">{a.amount} ETH</p>
                  <Badge variant={a.status === "completado" ? "default" : "secondary"}>{a.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
