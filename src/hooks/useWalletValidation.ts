/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useWalletValidation.ts
"use client";

import { useCallback, useState } from "react";
import { validateWallet } from "@/lib/api"; 
import { isAddressish } from "@/hooks/useGroupsAndVotes";

export type WalletValidationState =
  | "idle"
  | "validating"
  | "valid"
  | "invalid"
  | "error";

export function useWalletValidation(initial: string[] = [""]) {
  const [values, setValues] = useState<string[]>(initial);
  const [state, setState] = useState<WalletValidationState[]>(
    initial.map(() => "idle")
  );
  const [messages, setMessages] = useState<string[]>(initial.map(() => ""));

  const setAt = useCallback((i: number, val: string) => {
    setValues((prev) => {
      const next = [...prev];
      next[i] = val.trim();
      return next;
    });
    setState((prev) => {
      const next = [...prev];
      next[i] = "idle";
      return next;
    });
    setMessages((prev) => {
      const next = [...prev];
      next[i] = "";
      return next;
    });
  }, []);

  const add = useCallback(() => {
    setValues((v) => [...v, ""]);
    setState((s) => [...s, "idle"]);
    setMessages((m) => [...m, ""]);
  }, []);

  const removeAt = useCallback((i: number) => {
    setValues((v) => v.filter((_, idx) => idx !== i));
    setState((s) => s.filter((_, idx) => idx !== i));
    setMessages((m) => m.filter((_, idx) => idx !== i));
  }, []);

  const validateOne = useCallback(
    async (i: number) => {
      const addr = values[i]?.trim();

      // 1. Campo vacío
      if (!addr) {
        setState((s) => {
          const n = [...s];
          n[i] = "invalid";
          return n;
        });
        setMessages((m) => {
          const n = [...m];
          n[i] = "Vacío";
          return n;
        });
        return false;
      }

      // 2. Validación formato (ENS o 0x...)
      if (!isAddressish(addr)) {
        setState((s) => {
          const n = [...s];
          n[i] = "invalid";
          return n;
        });
        setMessages((m) => {
          const n = [...m];
          n[i] = "Formato inválido";
          return n;
        });
        return false;
      }

      // 3. Validación backend
      setState((s) => {
        const n = [...s];
        n[i] = "validating";
        return n;
      });

      try {
        const exists = await validateWallet(addr); // 👈 debe devolver true/false

        setState((s) => {
          const n = [...s];
          n[i] = exists ? "valid" : "invalid";
          return n;
        });
        setMessages((m) => {
          const n = [...m];
          n[i] = exists ? "" : "No existe en el sistema";
          return n;
        });

        return !!exists;
      } catch (e: any) {
        setState((s) => {
          const n = [...s];
          n[i] = "error";
          return n;
        });
        setMessages((m) => {
          const n = [...m];
          n[i] = e?.message || "Error al validar";
          return n;
        });
        return false;
      }
    },
    [values]
  );

  const validateAll = useCallback(async () => {
    const results = await Promise.all(values.map((_, i) => validateOne(i)));
    return results.every(Boolean);
  }, [values, validateOne]);

  const nonEmptyCount = values.filter((v) => v.trim()).length;

  const allValidated =
    nonEmptyCount > 0 &&
    values.every((v, i) => v.trim() === "" || state[i] === "valid");

  // 🔹 Reset: limpia a 1 input vacío
  const reset = useCallback(() => {
    setValues([""]);
    setState(["idle"]);
    setMessages([""]);
  }, []);

  return {
    values,
    state,
    messages,
    setAt,
    add,
    removeAt,
    validateOne,
    validateAll,
    allValidated,
    nonEmptyCount,
    reset,
  };
}
