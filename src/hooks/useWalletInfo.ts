"use client";

import { useMemo } from "react";
import { useAccount, useBalance, useEnsName, useChainId } from "wagmi";

export function useWalletInfo() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  console.log("aaaaaaaaaaaaaaaa: ",address)
  const { data: balance } = useBalance({
    address: address as `0x${string}` | undefined,
    chainId: 421614, // Arbitrum Sepolia
    query: { enabled: !!address },
  });

  // ENS vive en mainnet (1)
  const { data: ensName } = useEnsName({
    address: address as `0x${string}` | undefined,
    chainId: 1,
    query: { enabled: !!address },
  });

  const explorerBaseByChain: Record<number, string> = {
    1: "https://sepolia.arbiscan.io/",
    137: "https://polygonscan.com",
    8453: "https://basescan.org",
    10: "https://optimistic.etherscan.io",
    42161: "https://arbiscan.io",
    56: "https://bscscan.com",
  };

  const explorerUrl = useMemo(() => {
    if (!address) return undefined;
    const base = explorerBaseByChain[chainId] ?? "https://sepolia.arbiscan.io/";
    return `${base}/address/${address}`;
  }, [address, chainId]);

  const formatAddress = (addr?: string) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—";

  const copyToClipboard = (text?: string) => {
    if (!text || !navigator?.clipboard) return;
    navigator.clipboard.writeText(text).catch(() => {});
  };

  return {
    address,
    isConnected,
    chainId,
    balance,      // wagmi BalanceResult | undefined
    ensName,      // string | null | undefined
    explorerUrl,
    formatAddress,
    copyToClipboard,
  };
}
