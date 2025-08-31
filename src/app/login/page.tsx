/* eslint-disable react-hooks/rules-of-hooks */

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
import { useInlineContactFlow } from "@/hooks/useInlineContactFlow";
import InlineContactForm from "@/components/InlineContactForm";

const REQUIRE_CONTACT = process.env.NEXT_PUBLIC_REQUIRE_CONTACT === "true";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useWeb3Auth();
  const { isConnected } = useAccount();

  const inline = REQUIRE_CONTACT ? useInlineContactFlow() : null;
  const showingForm =
    REQUIRE_CONTACT && inline?.connected && inline?.phase === "needsContact";

  // Mostrar/ocultar overlay centrado
  useEffect(() => {
    const wrap = document.getElementById("w3a-login-wrap");
    if (!wrap) return;
    wrap.classList.remove("hidden"); // mostrar contenedor
    return () => {
      wrap.classList.add("hidden");
    }; // ocultar al salir
  }, []);

  // Si NO requerimos contacto y ya hay sesión → dashboard
  useEffect(() => {
    if (!REQUIRE_CONTACT && status === "connected" && isConnected) {
      router.replace("/dashboard");
    }
  }, [status, isConnected, router]);

  // Si SÍ requerimos contacto: cuando queda listo → dashboard
  useEffect(() => {
    if (REQUIRE_CONTACT && inline?.phase === "ready") {
      router.replace("/dashboard");
    }
  }, [inline?.phase, router]);

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-3xl sm:max-w-4xl">
        <div className="max-w-xl w-full mx-auto p-6 space-y-4">
          {/* Web3Auth modal mountpoint */}

          {showingForm && inline && (
            <InlineContactForm
              name={inline.name}
              setName={inline.setName}
              nameOk={inline.nameOk}
              email={inline.email}
              setEmail={inline.setEmail}
              emailOk={inline.emailOk}
              phone={inline.phone}
              setPhone={inline.setPhone}
              phoneOk={inline.phoneOk}
              onSave={inline.saveContact}
              error={inline.error ?? undefined}
            />
          )}

          {REQUIRE_CONTACT &&
            inline?.connected &&
            inline?.phase === "checking" && (
              <p className="text-sm text-muted-foreground">
                Procesando sesión…
              </p>
            )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center" />
    </div>
  );
}
