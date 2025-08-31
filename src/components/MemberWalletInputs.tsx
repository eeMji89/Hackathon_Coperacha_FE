"use client";

import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Button } from "@/ui/button";
import { WalletValidationState } from "@/hooks/useWalletValidation";
import { isAddressish, short } from "@/hooks/useGroupsAndVotes";
import { Plus, X, Check, ShieldCheck, Loader2 } from "lucide-react";

type Props = {
  values: string[];
  state: WalletValidationState[];
  messages: string[];
  onChangeAt: (i: number, value: string) => void;
  onAdd: () => void;
  onRemoveAt: (i: number) => void;
  onValidateAt: (i: number) => void;
  onValidateAll: () => void;
};

export default function MemberWalletInputs({
  values,
  state,
  messages,
  onChangeAt,
  onAdd,
  onRemoveAt,
  onValidateAt,
  onValidateAll,
}: Props) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Wallets / ENS de Miembros</Label>
        <Button type="button" variant="ghost" size="sm" onClick={onValidateAll}>
          Validar todas
        </Button>
      </div>

      <div className="space-y-2">
        {values.map((v, idx) => {
          const s = state[idx] ?? "idle";
          const hasText = v.length > 0;
          const formatOk = !hasText || isAddressish(v);
          const isValid = s === "valid";
          const isInvalid = s === "invalid" || s === "error" || (!formatOk && hasText);

          const borderClass = isValid
            ? "border-emerald-500"
            : isInvalid
            ? "border-rose-500"
            : "";

          const badge =
            s === "valid" ? (
              <span className="text-emerald-700 text-xs flex items-center gap-1">
                <Check className="h-3 w-3" /> Validada
              </span>
            ) : s === "validating" ? (
              <span className="text-muted-foreground text-xs flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" /> Validando…
              </span>
            ) : null;

          return (
            <div key={idx} className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  placeholder="0x... o nombre.eth"
                  value={v}
                  onChange={(e) => onChangeAt(idx, e.target.value)}
                  className={borderClass}
                />
                <div className="flex items-center justify-between mt-1">
                  {!formatOk && hasText ? (
                    <p className="text-xs text-rose-600">Formato inválido</p>
                  ) : messages[idx] ? (
                    <p className="text-xs text-rose-600">{messages[idx]}</p>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {hasText ? short(v) : "Ingresa una wallet o ENS"}
                    </span>
                  )}
                  {badge}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant={isValid ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => onValidateAt(idx)}
                  disabled={s === "validating"}
                  className="gap-2"
                >
                  {isValid ? (
                    <>
                      <Check className="h-4 w-4" />
                      Validada
                    </>
                  ) : s === "validating" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Validando
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4" />
                      Validar
                    </>
                  )}
                </Button>

                {values.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveAt(idx)}
                    aria-label="Eliminar"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <Button type="button" variant="ghost" onClick={onAdd} className="gap-2">
          <Plus className="h-4 w-4" />
          Agregar otra
        </Button>
      </div>
    </div>
  );
}

