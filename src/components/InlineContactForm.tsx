"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Input } from "@/ui/input";
import { Label } from "@/ui/label";
import { Badge } from "@/ui/badge";
import { useState } from "react";

type Props = {
  email: string;
  phone: string;
  setEmail: (v: string) => void;
  setPhone: (v: string) => void;
  emailOk: boolean;
  phoneOk: boolean;
  onSave: (email: string, phone: string) => Promise<void> | void;
  error?: string | null;
};

export default function InlineContactForm({
  email, phone, setEmail, setPhone, emailOk, phoneOk, onSave, error
}: Props) {
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!emailOk || !phoneOk) return;
    setSaving(true);
    try {
      await onSave(email, phone);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-yellow-300/50 bg-yellow-50 dark:bg-yellow-900/10">
      <CardHeader className="flex flex-row items-center justify-between gap-2">
        <CardTitle className="text-base">Completar datos de contacto</CardTitle>
        <Badge variant="outline" className="text-xs">Acción requerida</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Para continuar, necesitamos tu <b>correo</b> y <b>teléfono</b>.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input
              type="email"
              placeholder="tucorreo@dominio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {!emailOk && email.length > 0 && (
              <p className="text-xs text-red-600">Formato de email no válido.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Teléfono</Label>
            <Input
              type="tel"
              placeholder="+1 555 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            {!phoneOk && phone.length > 0 && (
              <p className="text-xs text-red-600">Número de teléfono no válido.</p>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving || !emailOk || !phoneOk}>
            {saving ? "Guardando…" : "Guardar y continuar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

