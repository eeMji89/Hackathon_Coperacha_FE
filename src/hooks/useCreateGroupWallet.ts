/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useCallback, useMemo, useState } from "react";
import { validateWallet, createGroupWallet } from "@/lib/api";

export type MemberField = {
  value: string;
  status: "idle" | "checking" | "valid" | "invalid";
  error?: string | null;
};

export function useCreateGroupWallet(currentUserAddress?: string) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [members, setMembers] = useState<MemberField[]>([
    { value: "", status: "idle" },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState(false);

  const normalize = (addr: string) => addr.trim();

  const addMember = useCallback(() => {
    setMembers((prev) => [...prev, { value: "", status: "idle" }]);
  }, []);

  const removeMember = useCallback((index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const setMemberValue = useCallback((index: number, value: string) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, value, status: "idle", error: null } : m))
    );
  }, []);

  const validateOne = useCallback(async (index: number) => {
    setMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, status: "checking", error: null } : m))
    );
    const value = normalize(members[index].value);
    try {
      const ok = await validateWallet(value);
      setMembers((prev) =>
        prev.map((m, i) =>
          i === index
            ? { ...m, value, status: ok ? "valid" : "invalid", error: ok ? null : "Wallet no encontrada" }
            : m
        )
      );
    } catch (e: any) {
      setMembers((prev) =>
        prev.map((m, i) =>
          i === index
            ? { ...m, status: "invalid", error: e?.message ?? "Error al validar" }
            : m
        )
      );
    }
  }, [members]);

  const allValid = useMemo(() => {
    if (!name.trim() || !description.trim()) return false;
    if (members.length === 0) return false;
    return members.every((m) => m.status === "valid");
  }, [name, description, members]);

  const reset = useCallback(() => {
    setName("");
    setDescription("");
    setMembers([{ value: "", status: "idle" }]);
    setSubmitting(false);
    setSubmitError(null);
    setSubmitOk(false);
  }, []);

  const submit = useCallback(async () => {
    if (!allValid) return;
    setSubmitting(true);
    setSubmitError(null);
    setSubmitOk(false);
    try {
      const uniq = new Set<string>();
      const list = members
        .map((m) => normalize(m.value))
        .filter((x) => x.length > 0);

      // agrega automáticamente la wallet del creador
      if (currentUserAddress) list.push(normalize(currentUserAddress));

      // quita duplicados
      const finalMembers = Array.from(new Set(list));

      await createGroupWallet({
        name: name.trim(),
        description: description.trim(),
        members: finalMembers,
      });

      setSubmitOk(true);
      setOpen(false); // cierra el diálogo
      reset(); // limpia el formulario
    } catch (e: any) {
      setSubmitError(e?.message ?? "No se pudo crear el grupo");
    } finally {
      setSubmitting(false);
    }
  }, [allValid, members, name, description, currentUserAddress, reset]);

  return {
    // estado de diálogo si lo controlas desde el hook
    open,
    setOpen,

    name,
    setName,
    description,
    setDescription,

    members,
    setMemberValue,
    addMember,
    removeMember,
    validateOne,

    allValid,
    submitting,
    submitError,
    submitOk,
    submit,
    reset,
  };
}
