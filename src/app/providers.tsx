/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Web3AuthProvider } from "@web3auth/modal/react";
import { WagmiProvider } from "@web3auth/modal/react/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { web3AuthContextConfig } from "@/lib/web3authContext";

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  // Lee el modo/target desde tu config (si no existen, asumimos "modal").
  const mode = (web3AuthContextConfig as any)?.uiConfig?.mode ?? "modal";
  const targetId = (web3AuthContextConfig as any)?.uiConfig?.targetId ?? "w3a-login";

  // En "embedded" arrancamos SIN inicializar hasta verificar el target.
  const [canInit, setCanInit] = useState(mode !== "embedded");

  useEffect(() => {
    if (mode !== "embedded") return;
    const el = document.getElementById(targetId);
    if (el) {
      setCanInit(true);
    } else {
      // No hay contenedor para el embed → no inicialices y redirige al login.
      setCanInit(false);
      if (pathname !== "/login") router.replace("/login");
    }
  }, [mode, targetId, pathname, router]);

  // Evita montar Web3AuthProvider si falta el target en embedded (previene el error).
  if (mode === "embedded" && !canInit) {
    return <div className="p-4 text-sm text-muted-foreground">Redirigiendo…</div>;
  }

  return (
    <Web3AuthProvider config={web3AuthContextConfig}>
      <QueryClientProvider client={queryClient}>
        <WagmiProvider>{children}</WagmiProvider>
      </QueryClientProvider>
    </Web3AuthProvider>
  );
}

