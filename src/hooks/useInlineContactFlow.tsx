/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useInlineContactFlow.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useWeb3Auth, useWeb3AuthUser } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { createUser, getUserByWallet, BackendUser } from "@/lib/api";

export type InlineContactPhase = "idle" | "checking" | "needsContact" | "ready" | "error";

type Options = {
  requireName?: boolean;
  requireEmail?: boolean;
  requirePhone?: boolean;
};

export function useInlineContactFlow(opts?: Options) {
  const requireName = opts?.requireName ?? true;
  const requireEmail = opts?.requireEmail ?? true;
  const requirePhone = opts?.requirePhone ?? true;

  const { status } = useWeb3Auth();
  const { getUserInfo } = useWeb3AuthUser();
  const { address, isConnected } = useAccount();

  const connected = status === "connected" && isConnected && !!address;

  const [phase, setPhase] = useState<InlineContactPhase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [exists, setExists] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!connected) {
      setPhase("idle");
      return;
    }

    (async () => {
      setPhase("checking");
      setError(null);

      // 1) Prefill desde Web3Auth
      const ui = (await getUserInfo().catch(() => ({}))) as any;
      const pName = ui?.name?.trim?.();
      const pEmail = ui?.email?.trim?.();
      const pPhone = ui?.phoneNumber || ui?.phone;

      if (pName) setName(pName);
      if (pEmail) setEmail(pEmail);
      if (pPhone) setPhone(pPhone);

      // 2) Ver si ya existe en tu backend
      const found: BackendUser | null = address ? await getUserByWallet(address) : null;
      if (cancelled) return;

      setExists(!!found);
      if (found) {
        if (found.nombre && !pName) setName(found.nombre);
        if (found.correo && !pEmail) setEmail(found.correo);
        if (found.celular && !pPhone) setPhone(found.celular);
      }

      const needName = requireName && !(found?.nombre || pName);
      const needEmail = requireEmail && !(found?.correo || pEmail);
      const needPhone = requirePhone && !(found?.celular || pPhone);

      setPhase(needName || needEmail || needPhone ? "needsContact" : "ready");
    })();

    return () => {
      cancelled = true;
    };
  }, [connected, address, getUserInfo, requireName, requireEmail, requirePhone]);

  const saveContact = async (nombre: string, correo: string, celular: string) => {
    if (!address) return;
    setError(null);
    try {
      if (!exists) {
        await createUser({
          name: nombre,
          email: correo,
          phone: celular,
          wallet: address,
        });
      }
      setPhase("ready");
    } catch (e: any) {
      setError(e?.message || "No se pudo guardar los datos.");
      setPhase("error");
    }
  };

  // Validaciones simples
  const nameOk = useMemo(() => !!name.trim(), [name]);
  const emailOk = useMemo(
    () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || ""),
    [email]
  );
  const phoneOk = useMemo(
    () => /^[0-9+\-\s()]{7,20}$/.test(phone || ""),
    [phone]
  );

  return {
    phase, error, connected, exists,
    name, setName, nameOk,
    email, setEmail, emailOk,
    phone, setPhone, phoneOk,
    saveContact,
  };
}

