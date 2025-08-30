"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWeb3Auth } from "@web3auth/modal/react";
import { useAccount } from "wagmi";
// ⬇️ opcional: si estabas usando el flow inline, lo importas condicional
import { useInlineContactFlow } from "@/hooks/useInlineContactFlow";
import InlineContactForm from "@/components/InlineContactForm";

const REQUIRE_CONTACT = process.env.NEXT_PUBLIC_REQUIRE_CONTACT === "true";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useWeb3Auth();
  const { isConnected } = useAccount();

  useEffect(() => {
  const el = document.getElementById("w3a-login");
  if (el) el.classList.remove("hidden");
  return () => { if (el) el.classList.add("hidden"); };
}, []);


  // 🔕 MODO APAGADO: si hay sesión, manda directo al dashboard
  useEffect(() => {
    if (!REQUIRE_CONTACT && status === "connected" && isConnected) {
      router.replace("/dashboard");
    }
  }, [status, isConnected, router]);

  // 🔔 MODO ENCENDIDO: mantén tu flow inline
  const inline = REQUIRE_CONTACT
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ? useInlineContactFlow()
    : null;

  const showingForm = REQUIRE_CONTACT && inline?.connected && inline?.phase === "needsContact";

  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <div className="max-w-xl w-full mx-auto p-6 space-y-4">
          <div id="w3a-login" style={{ display: showingForm ? "none" : "block" }} />

          {showingForm && inline && (
            <InlineContactForm
              email={inline.prefillEmail}
              phone={inline.prefillPhone}
              setEmail={inline.setPrefillEmail}
              setPhone={inline.setPrefillPhone}
              emailOk={inline.emailOk}
              phoneOk={inline.phoneOk}
              onSave={inline.saveContact}
              error={inline.error ?? undefined}
            />
          )}

          {REQUIRE_CONTACT && inline?.connected && inline?.phase === "checking" && (
            <p className="text-sm text-muted-foreground">Procesando sesión…</p>
          )}
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center" />
    </div>
  );
}
