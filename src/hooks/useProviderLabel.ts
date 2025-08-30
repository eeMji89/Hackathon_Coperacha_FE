/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useWeb3Auth, useWeb3AuthUser } from "@web3auth/modal/react";

export function useProviderLabel() {
  const { connector } = useAccount();
  const { web3Auth } = useWeb3Auth();         // para connectedAdapterName
  const { getUserInfo } = useWeb3AuthUser();  // para typeOfLogin (social)

  const [label, setLabel] = useState("Web3Auth");

  // 1) nombre del conector (wagmi)
  useEffect(() => {
    if (connector?.name) setLabel(connector.name);
  }, [connector]);

  // 2) detectar wallets inyectados por flags
  useEffect(() => {
    if (label !== "Injected" && connector?.name) return;
    const eth = (globalThis as any)?.ethereum;
    if (eth?.isMetaMask) setLabel("MetaMask");
    else if (eth?.isCoinbaseWallet) setLabel("Coinbase Wallet");
    else if (eth?.isBraveWallet) setLabel("Brave Wallet");
    else if (eth?.isOkxWallet) setLabel("OKX Wallet");
  }, [label, connector]);

  // 4) si es social, añade el tipo (google/email/…)
  useEffect(() => {
    getUserInfo()
      .then((ui: any) => {
        if (ui?.typeOfLogin) {
          setLabel((prev) =>
            prev.startsWith("Web3Auth") ? `Web3Auth (${ui.typeOfLogin})` : prev
          );
        }
      })
      .catch(() => {});
  }, [getUserInfo]);

  return label;
}
