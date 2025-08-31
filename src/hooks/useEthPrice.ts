/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useEthPrice.ts
"use client";

import { useEffect, useState } from "react";

export function useEthPrice(fiat: string = "HNL") {
  const [rate, setRate] = useState<number | null>(null); // 1 ETH = rate HNL
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancel = false;

    async function fetchRate() {
      setLoading(true);
      setError(null);

      try {
        let r: number | null = null;

        // 1) Backend opcional: NEXT_PUBLIC_PRICE_API_URL=/api
        const backend = process.env.NEXT_PUBLIC_PRICE_API_URL;
        if (backend) {
          try {
            const res = await fetch(
              `${backend.replace(/\/$/, "")}/price/eth?fiat=${encodeURIComponent(
                fiat
              )}`
            );
            if (res.ok) {
              const j = await res.json();
              // admite varias formas de respuesta
              const v =
                typeof j?.price === "number"
                  ? j.price
                  : typeof j?.rate === "number"
                  ? j.rate
                  : typeof j?.eth?.[fiat.toLowerCase()] === "number"
                  ? j.eth[fiat.toLowerCase()]
                  : null;

              if (typeof v === "number") r = v;
            }
          } catch {
            // sigue a CoinGecko
          }
        }

        // 2) CoinGecko
        if (r == null) {
          try {
            const res2 = await fetch(
              `https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=${fiat.toLowerCase()}`
            );
            if (res2.ok) {
              const j2 = await res2.json();
              const v2 = j2?.ethereum?.[fiat.toLowerCase()];
              if (typeof v2 === "number") r = v2;
            }
          } catch {
            // sigue a fallback env
          }
        }

        // 3) Fallback por env
        if (r == null) {
          const fallback = Number(process.env.NEXT_PUBLIC_ETH_TO_HNL);
          if (!Number.isNaN(fallback) && fallback > 0) r = fallback;
        }

        if (!cancel) setRate(r);
      } catch (e: any) {
        if (!cancel) setError(e?.message || "No se pudo obtener precio.");
      } finally {
        if (!cancel) setLoading(false);
      }
    }

    fetchRate();
    return () => {
      cancel = true;
    };
  }, [fiat]);

  return { rate, loading, error };
}
