/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/ui/card";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import {
  Wallet,
  Copy,
  ExternalLink,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
} from "lucide-react";

import { useWalletInfo } from "@/hooks/useWalletInfo";
import { useEthPrice } from "@/hooks/useEthPrice";
import { getSaldos } from "@/lib/api";

type TxType = "receive" | "send";
type TxItem = {
  id: number;
  type: TxType;
  amount: number; // positivo (recibido) o negativo (enviado), en USD "mock" para UI
  from: string;
  to: string;
  hash: string;
  date: string; // ISO
  description: string;
  status: "confirmado" | "pendiente" | "fallido";
};

export function IndividualFundsView() {
  const [showTransactions, setShowTransactions] = useState(false);

  const {
    address,
    isConnected,
    balance, // { formatted: string, symbol: "ETH" }
    ensName,
    explorerUrl,
    formatAddress,
    copyToClipboard,
  } = useWalletInfo();

  // Precio ETH → HNL
  const { rate: ethToHnl } = useEthPrice("HNL");

  // ETH numérico (puede ser null si no hay balance)
  const ethAmount = useMemo(() => {
    if (!balance?.formatted) return null;
    const n = Number(balance.formatted);
    return Number.isFinite(n) ? n : null;
  }, [balance]);

  // Conversión a HNL
  const hnlAmount = useMemo(() => {
    if (ethAmount == null || ethToHnl == null) return null;
    return ethAmount * ethToHnl;
  }, [ethAmount, ethToHnl]);

  // ===== MOCK: historial de transacciones (se deja como estaba) =====
  const transactionHistory: TxItem[] = [
    {
      id: 1,
      type: "receive",
      amount: 50000,
      from: "0x1234567890abcdef1234567890abcdef12345678",
      to: address || "0x742d35Cc6434C0532925a3b8D965Ba86D5e4EF1e",
      hash: "0xabc123def456abc123def456abc123def456abc123def456abc123def4560001",
      date: "2024-01-15T10:30:00Z",
      description: "Recepción de fondos grupales",
      status: "confirmado",
    },
    {
      id: 2,
      type: "send",
      amount: -25000,
      from: address || "0x742d35Cc6434C0532925a3b8D965Ba86D5e4EF1e",
      to: "0x9876abcdef9876abcdef9876abcdef9876abcdef",
      hash: "0x789xyz123abc789xyz123abc789xyz123abc789xyz123abc789xyz123abc0002",
      date: "2024-01-12T14:20:00Z",
      description: "Propuesta de gasto aprobada",
      status: "confirmado",
    },
    {
      id: 3,
      type: "receive",
      amount: 75000,
      from: "0x5555aaaabbbbccccddddeeeeffff000011112222",
      to: address || "0x742d35Cc6434C0532925a3b8D965Ba86D5e4EF1e",
      hash: "0xdef456abc789def456abc789def456abc789def456abc789def456abc7890003",
      date: "2024-01-10T09:15:00Z",
      description: "Depósito inicial",
      status: "confirmado",
    },
    {
      id: 4,
      type: "send",
      amount: -5000,
      from: address || "0x742d35Cc6434C0532925a3b8D965Ba86D5e4EF1e",
      to: "0x1111222233334444555566667777888899990000",
      hash: "0x123abc456def123abc456def123abc456def123abc456def123abc456def0004",
      date: "2024-01-08T16:45:00Z",
      description: "Pago de comisiones de red",
      status: "confirmado",
    },
    {
      id: 5,
      type: "receive",
      amount: 30000,
      from: "0x3333444455556666777788889999aaaabbbbcccc",
      to: address || "0x742d35Cc6434C0532925a3b8D965Ba86D5e4EF1e",
      hash: "0x987zyx654fed987zyx654fed987zyx654fed987zyx654fed987zyx654fed0005",
      date: "2024-01-05T11:00:00Z",
      description: "Dividendos de inversión",
      status: "confirmado",
    },
  ];

  // ===== Helpers UI =====
  const formatUSD = (amount: number) =>
    new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "USD",
    }).format(Math.abs(amount));

  const formatHNL = (amount: number) =>
    new Intl.NumberFormat("es-HN", {
      style: "currency",
      currency: "HNL",
    }).format(amount);

  const getTransactionIcon = (type: TxType) => {
    switch (type) {
      case "receive":
        return <ArrowDownRight className="h-4 w-4 text-green-600" />;
      case "send":
        return <ArrowUpRight className="h-4 w-4 text-red-600" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const fmtHNL = (n: number | null | undefined) =>
  typeof n === "number" && !Number.isNaN(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : "--";

const fmtETH = (n: number | null | undefined) =>
  typeof n === "number" && !Number.isNaN(n)
    ? n.toLocaleString(undefined, { maximumFractionDigits: 6 })
    : "--";

  const getTransactionColor = (type: TxType) => {
    switch (type) {
      case "receive":
        return "text-green-600";
      case "send":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const [fiHNL, setFiHNL] = useState<number | null>(null);
  const [fiETH, setFiETH] = useState<number>(0);
  const [cgHNL, setCgHNL] = useState<number | null>(null);
  const [cgETH, setCgETH] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const totalHNL = useMemo(() => (fiHNL ?? 0) + (cgHNL ?? 0), [fiHNL, cgHNL]);
  const totalETH = useMemo(() => (fiETH || 0) + (cgETH || 0), [fiETH, cgETH]);

  const toNum = (x: unknown) => {
    const n = parseFloat(String(x ?? ""));
    return Number.isFinite(n) ? n : 0;
  };

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
      <div className="text-xs text-muted-foreground mt-0.5">
        {fmtETH(eth)} ETH
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold">Fondos Individuales</h2>
        <p className="text-muted-foreground">
          Gestiona tu billetera personal de inversión
        </p>
      </div>

      {/* Wallet Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Mi Billetera Principal
                </CardTitle>
                <CardDescription>
                  {ensName ? ensName : formatAddress(address)}
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {isConnected ? "Conectado" : "Desconectado"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Balance (HNL grande, ETH chico) */}
          <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Saldo Total</p>
              <p className="text-3xl font-bold text-primary">
                {loading ? (
                  <div className="text-sm text-muted-foreground">Cargando…</div>
                ) : (
                  renderAmount(totalHNL, totalETH)
                )}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {ethAmount != null ? `≈ ${ethAmount.toFixed(4)} ETH` : ""}
              </p>
            </div>
          </div>

          {/* Wallet Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
              <div>
                <p className="text-sm font-medium">Dirección de Billetera</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {address ?? "—"}
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(address || "")}
                  disabled={!address}
                  title="Copiar dirección"
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() =>
                    explorerUrl && window.open(explorerUrl, "_blank")
                  }
                  disabled={!explorerUrl}
                  title="Abrir en explorer"
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
              </div>
            </div>

            {ensName && (
              <div className="flex items-center justify-between p-3 bg-card border border-border rounded-lg">
                <div>
                  <p className="text-sm font-medium">Nombre ENS</p>
                  <p className="text-xs text-muted-foreground">{ensName}</p>
                </div>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(ensName)}
                    title="Copiar ENS"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}
            {/* Se eliminó la sección de Proveedor */}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Dialog open={showTransactions} onOpenChange={setShowTransactions}>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex-1">
                  Ver Transacciones
                </Button>
              </DialogTrigger>

              {/* Modal ancho y alto acotados; SIN overflow en este nodo */}
              <DialogContent className="w-[95vw] sm:max-w-[1000px] p-0">
                {/* Grid de 3 filas: header / scroll-area / footer */}
                <div className="grid grid-rows-[auto_minmax(0,1fr)_auto]">
                  {/* Header */}
                  <div className="p-4 border-b">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Historial de Transacciones
                      </DialogTitle>
                      <DialogDescription className="text-left">
                        Historial completo de las transacciones de tu billetera
                      </DialogDescription>
                    </DialogHeader>

                    {/* Resumen rápido */}
                    <div className="bg-muted/50 rounded-lg p-3 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Billetera</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {formatAddress(address)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">Saldo Actual</p>
                          <p className="text-lg font-bold text-primary">
                            {hnlAmount != null ? formatHNL(hnlAmount) : "—"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {ethAmount != null
                              ? `≈ ${ethAmount.toFixed(4)} ETH`
                              : ""}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cuerpo scrolleable (vertical y horizontal) */}
                  <div className="overflow-auto p-4">
                    <div className="overflow-auto">
                      <Table className="min-w-[900px]">
                        <TableHeader>
                          <TableRow>
                            <TableHead className="whitespace-nowrap">
                              Tipo
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Monto
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Dirección
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Fecha
                            </TableHead>
                            <TableHead className="whitespace-nowrap">
                              Estado
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {transactionHistory.map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-2">
                                  {getTransactionIcon(tx.type)}
                                  <div>
                                    <p className="text-sm font-medium capitalize">
                                      {tx.type === "receive"
                                        ? "Recibido"
                                        : "Enviado"}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {tx.description}
                                    </p>
                                  </div>
                                </div>
                              </TableCell>

                              <TableCell
                                className={`whitespace-nowrap font-medium ${getTransactionColor(
                                  tx.type
                                )}`}
                              >
                                {tx.type === "receive" ? "+" : ""}
                                {formatUSD(tx.amount)}
                              </TableCell>

                              <TableCell className="whitespace-nowrap">
                                <div className="font-mono text-xs">
                                  <p className="text-muted-foreground">
                                    {tx.type === "receive" ? "De:" : "A:"}{" "}
                                    {formatAddress(
                                      tx.type === "receive" ? tx.from : tx.to
                                    )}
                                  </p>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-auto p-0 text-xs text-primary hover:no-underline"
                                    onClick={() => copyToClipboard(tx.hash)}
                                    title="Copiar hash"
                                  >
                                    {formatAddress(tx.hash)}
                                  </Button>
                                </div>
                              </TableCell>

                              <TableCell className="whitespace-nowrap">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(tx.date).toLocaleDateString(
                                    "es-ES",
                                    {
                                      day: "2-digit",
                                      month: "2-digit",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )}
                                </div>
                              </TableCell>

                              <TableCell className="whitespace-nowrap">
                                <Badge
                                  variant="outline"
                                  className="text-xs bg-green-50 text-green-700 border-green-200"
                                >
                                  {tx.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Footer fijo */}
                  <div className="p-4 border-t flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => setShowTransactions(false)}
                    >
                      Cerrar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {/* Acceso directo al explorer */}
            <Button
              className="flex-1"
              onClick={() => explorerUrl && window.open(explorerUrl, "_blank")}
              disabled={!explorerUrl}
              title="Abrir en explorer"
            >
              Abrir en Explorer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
