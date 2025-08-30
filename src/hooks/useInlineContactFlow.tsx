/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useWeb3Auth, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { getJSON, postJSON, patchJSON } from "@/lib/api";
import type { Client } from "@/lib/types";

export type InlineContactPhase = "idle" | "checking" | "needsContact" | "ready" | "error";

type Options = {
  requireEmail?: boolean; // default true
  requirePhone?: boolean; // default true
};

const REQUIRE_CONTACT = process.env.NEXT_PUBLIC_REQUIRE_CONTACT === "true";

export function useInlineContactFlow(opts?: Options) {
  const requireEmail = opts?.requireEmail ?? true;
  const requirePhone = opts?.requirePhone ?? true;

  const { status } = useWeb3Auth();              // "connected" | "connecting" | "disconnected"
  const { getUserInfo } = useWeb3AuthUser();
  const { address, isConnected } = useAccount();

  const [phase, setPhase] = useState<InlineContactPhase>("idle");
  const [exists, setExists] = useState(false);
  const [prefillEmail, setPrefillEmail] = useState("");
  const [prefillPhone, setPrefillPhone] = useState("");
  const [error, setError] = useState<string | null>(null);

  const connected = status === "connected" && isConnected && !!address;

  // ⬇️ si el feature está desactivado, no llames al backend ni muestres el form
if (!REQUIRE_CONTACT) {
  return {
    phase: connected ? "ready" : "idle",
    error: null,
    connected,
    address,
    prefillEmail: "",
    prefillPhone: "",
    setPrefillEmail: () => {},
    setPrefillPhone: () => {},
    emailOk: true,
    phoneOk: true,
    saveContact: async () => {}, // no-op
  };
}

  
  // boot: al conectarse, decide si falta info o está listo
  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    let cancelled = false;
    if (!connected) {
      setPhase("idle");
      return;
    }

    (async () => {
      setPhase("checking");
      setError(null);

      // 1) Trae datos del proveedor (OpenLogin)
      const ui = (await getUserInfo().catch(() => ({}))) as any;
      const emailFromProvider: string | undefined = ui?.email;
      const phoneFromProvider: string | undefined = ui?.phoneNumber || ui?.phone;

      if (emailFromProvider) setPrefillEmail(emailFromProvider);
      if (phoneFromProvider) setPrefillPhone(phoneFromProvider);

      // 2) ¿Existe perfil en backend?
      try {
        const found = await getJSON<Client>(`/clients/wallet/${address}`);
        if (!cancelled) {
          setExists(true);
          if (found?.email && !emailFromProvider) setPrefillEmail(found.email);
          if (found?.phone && !phoneFromProvider) setPrefillPhone(found.phone ?? "");
        }

        const needEmail = requireEmail && !(found?.email || emailFromProvider);
        const needPhone = requirePhone && !(found?.phone || phoneFromProvider);

        if (!cancelled) {
          setPhase(needEmail || needPhone ? "needsContact" : "ready");
        }
        return;
      } catch {
        // 404 o backend no disponible
        const canCreate =
          (!requireEmail || !!emailFromProvider) &&
          (!requirePhone || !!phoneFromProvider);

        if (!cancelled) {
          setExists(false);
          setPhase(canCreate ? "ready" : "needsContact");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [connected, address, getUserInfo, requireEmail, requirePhone]);

  // guardar (crear/actualizar) y marcar listo
  const saveContact = async (email: string, phone: string) => {
    if (!address) return;
    setError(null);
    try {
      if (exists) {
        await patchJSON<Client>(`/clients/${address}`, { email, phone });
      } else {
        await postJSON<Client>("/clients", { email, phone, wallet: address });
      }
      setPhase("ready");
    } catch (e: any) {
      setError(e?.message || "No se pudo guardar los datos.");
      setPhase("error");
    }
  };

  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(prefillEmail || ""),
    [prefillEmail]
  );
  const phoneOk = useMemo(
    () => /^[0-9+\-\s()]{7,20}$/.test(prefillPhone || ""),
    [prefillPhone]
  );

  return {
    phase,            // "idle" | "checking" | "needsContact" | "ready" | "error"
    error,
    connected,
    address,

    // valores a mostrar en el form
    prefillEmail,
    prefillPhone,
    setPrefillEmail,
    setPrefillPhone,

    // validaciones simples
    emailOk,
    phoneOk,

    // acción para guardar
    saveContact,
  };
}
