/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useUserProfile.ts
"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useWeb3Auth, useWeb3AuthUser } from "@web3auth/modal/react";
import { getJSON } from "@/lib/rest";

export type UserProfile = {
  name?: string;
  email?: string;
  phone?: string;
  wallet?: string;
};

type BackendUser = {
  nombre?: string;
  correo?: string;
  celular?: string;
  billetera?: string;
};

export function useUserProfile() {
  const { address, isConnected } = useAccount();
  const { status } = useWeb3Auth();
  const { getUserInfo } = useWeb3AuthUser();

  const [profile, setProfile] = useState<UserProfile>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        // 1) Si hay wallet, intenta backend primero
        if (address) {
          try {
            const u = await getJSON<BackendUser>(`/users/wallet/${address}`);
            if (!cancelled && u) {
              setProfile({
                name: u.nombre ?? "",
                email: u.correo ?? "",
                phone: u.celular ?? "",
                wallet: u.billetera ?? address,
              });
              setLoading(false);
              return;
            }
          } catch {
            // sigue al fallback
          }
        }

        // 2) Fallback: Web3Auth getUserInfo (si está conectado con Web3Auth)
        if (status === "connected") {
          try {
            const ui = (await getUserInfo()) as any;
            if (!cancelled && ui) {
              setProfile({
                name: ui?.name ?? "",
                email: ui?.email ?? "",
                phone: ui?.phoneNumber ?? ui?.phone ?? "",
                wallet: address ?? "",
              });
              setLoading(false);
              return;
            }
          } catch {
            // ignore
          }
        }

        // 3) Último recurso: solo wallet si la hay
        if (!cancelled) {
          setProfile({
            name: "",
            email: "",
            phone: "",
            wallet: address ?? "",
          });
          setLoading(false);
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "No se pudo cargar el perfil");
          setLoading(false);
        }
      }
    }

    if (isConnected || status === "connected") {
      load();
    } else {
      // sin conexión, deja vacío
      setProfile({});
      setLoading(false);
    }

    return () => {
      cancelled = true;
    };
  }, [address, isConnected, status, getUserInfo]);

  return { profile, loading, error };
}
