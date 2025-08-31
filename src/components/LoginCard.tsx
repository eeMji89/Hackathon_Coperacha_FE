"use client";

import { useEffect, useState } from "react";
import {
  useWeb3Auth,
  useWeb3AuthConnect,
  useWeb3AuthDisconnect,
  useWeb3AuthUser,
} from "@web3auth/modal/react";
import { useAccount, useBalance, useSignMessage } from "wagmi";
import { useRouter } from "next/navigation";

type MinimalAuthInfo = {
  email?: string;
  name?: string;
  profileImage?: string;
  typeOfLogin?: string;
  verifier?: string;
  verifierId?: string;
};

export default function LoginCard() {
  const router = useRouter();
  const { status } = useWeb3Auth(); // "connected" | "disconnected" | "connecting"
  const { connect } = useWeb3AuthConnect();
  const { disconnect } = useWeb3AuthDisconnect();
  const { getUserInfo } = useWeb3AuthUser();

  const { address, isConnected } = useAccount();
  const { data: bal } = useBalance({
    address: address as `0x${string}` | undefined,
    query: { enabled: !!address },
  });
  const { signMessageAsync } = useSignMessage();

  const [info, setInfo] = useState<MinimalAuthInfo | null>(null);
  const [sig, setSig] = useState("");

function isPopupClosedError(e: unknown) {
  const msg = String((e as any)?.message || e || "").toLowerCase();
  return (
    msg.includes("popup has been closed") ||
    msg.includes("wallet popup has been closed")
  );
}

const handleConnect = async () => {
  try {
    await connect();                 // abre el modal
    const ui = await getUserInfo();  // opcional
    setInfo(ui as MinimalAuthInfo);
    router.push("/dashboard");
  } catch (e: any) {
    if (isPopupClosedError(e)) return;            // <- SILENCIAR 5114
    console.warn("Web3Auth connect() falló:", e); // usa warn, no error
  }

  const handleDisconnect = async () => {
    await disconnect();
    setInfo(null);
    setSig("");
  };

  const handleSign = async () => {
    try {
      const s = await signMessageAsync({
        message: "Hola desde Web3Auth + Wagmi 👋",
      });
      setSig(s);
    } catch (e) {
      console.error(e);
      alert("Firma cancelada o fallida.");
    }
  };

  // Si ya está conectado (p. ej. tras refresh) y aún no cargamos info, la pedimos.
  useEffect(() => {
    if (status === "connected" && !info) {
      getUserInfo()
        .then((ui) => setInfo(ui as MinimalAuthInfo))
        .catch(() => {});
      router.replace("/dashboard");
    }
  }, [status, info, getUserInfo]);

  if (status !== "connected") {
    return (
      <div className="w-full max-w-xl rounded-xl border p-4 flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Iniciar sesión</h2>
        <button
          onClick={handleConnect}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
        >
          Conectar con Web3Auth
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-xl border p-4 flex flex-col gap-3">
      <h2 className="text-lg font-semibold">Sesión iniciada</h2>
      <div className="text-sm space-y-1">
        <div>
          <span className="font-medium">Conectado:</span> {String(isConnected)}
        </div>
        <div>
          <span className="font-medium">Address:</span> {address ?? "—"}
        </div>
        <div>
          <span className="font-medium">Login:</span> {info?.typeOfLogin ?? "—"}
        </div>
        <div>
          <span className="font-medium">Email:</span> {info?.email ?? "—"}
        </div>
        {bal && (
          <div>
            <span className="font-medium">Balance:</span> {bal.formatted}{" "}
            {bal.symbol}
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSign}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
        >
          Firmar mensaje
        </button>
        <button
          onClick={handleDisconnect}
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/10"
        >
          Salir
        </button>
      </div>

      {sig && (
        <p className="break-all text-xs mt-2">
          <span className="font-medium">Firma:</span> {sig}
        </p>
      )}
    </div>
  );
}
